import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await res.json();

    if (!res.ok) {
      // Refresh failed — clear cookies
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 401 },
      );
      response.cookies.set("accessToken", "", { ...COOKIE_BASE, maxAge: 0 });
      response.cookies.set("refreshToken", "", { ...COOKIE_BASE, maxAge: 0 });
      response.cookies.set("userRole", "", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    const tokens = json.data ?? json;

    // Fetch profile to keep userRole cookie in sync
    const profileRes = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    const profileJson = profileRes.ok ? await profileRes.json() : null;
    const user = profileJson?.data ?? profileJson;

    const response = NextResponse.json({ success: true });

    response.cookies.set("accessToken", tokens.accessToken, {
      ...COOKIE_BASE,
      maxAge: 900,
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      ...COOKIE_BASE,
      maxAge: 604800,
    });

    if (user?.role) {
      response.cookies.set("userRole", user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 604800,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
