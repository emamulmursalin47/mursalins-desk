"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/api";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount — skip fetch if we already know there's no session
  useEffect(() => {
    const cached = sessionStorage.getItem("auth_user");
    if (cached === "none") {
      setLoading(false);
      return;
    }
    if (cached && cached !== "none") {
      try {
        setUser(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* fall through to fetch */ }
    }
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          sessionStorage.setItem("auth_user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("auth_user", "none");
        }
      })
      .catch(() => {
        sessionStorage.setItem("auth_user", "none");
      })
      .finally(() => setLoading(false));
  }, []);

  // Proactive token refresh — refresh every 12 min (before 15-min expiry)
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 12 * 60 * 1000; // 12 minutes

    const refresh = () => {
      fetch("/api/auth/refresh", { method: "POST" })
        .then((res) => {
          if (!res.ok) {
            // Refresh failed — session truly expired
            setUser(null);
          }
        })
        .catch(() => {});
    };

    const id = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [user]);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      sessionStorage.setItem("auth_user", JSON.stringify(data.user));
      // Use redirectTo if provided, otherwise route based on role
      const dest =
        redirectTo || (data.user?.role === "ADMIN" ? "/dashboard" : "/portal");
      router.push(dest);
    },
    [router],
  );

  const register = useCallback(
    async (body: {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data.user);
      sessionStorage.setItem("auth_user", JSON.stringify(data.user));
      router.push(data.user?.role === "ADMIN" ? "/dashboard" : "/portal");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    sessionStorage.removeItem("auth_user");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
