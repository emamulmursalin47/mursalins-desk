import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

async function fetchProfile(token: string) {
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? json;
}

export async function GET(req: NextRequest) {
  let token = req.cookies.get("accessToken")?.value;
  const refreshTokenValue = req.cookies.get("refreshToken")?.value;

  // Try with existing access token first
  if (token) {
    const user = await fetchProfile(token).catch(() => null);
    if (user) {
      return NextResponse.json({ user });
    }
  }

  // Access token missing or expired — try refreshing if we have a refresh token
  if (refreshTokenValue) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        const tokens = refreshJson.data ?? refreshJson;

        const user = await fetchProfile(tokens.accessToken).catch(() => null);
        if (user) {
          const response = NextResponse.json({ user });

          // Update cookies with fresh tokens
          response.cookies.set("accessToken", tokens.accessToken, {
            ...COOKIE_BASE,
            maxAge: 900,
          });
          response.cookies.set("refreshToken", tokens.refreshToken, {
            ...COOKIE_BASE,
            maxAge: 604800,
          });
          if (user.role) {
            response.cookies.set("userRole", user.role, {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax" as const,
              path: "/",
              maxAge: 604800,
            });
          }

          return response;
        }
      }
    } catch {
      // Refresh failed — fall through to 401
    }
  }

  return NextResponse.json({ user: null }, { status: 401 });
}
