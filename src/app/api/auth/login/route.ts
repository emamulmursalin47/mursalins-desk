import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || "Invalid credentials" },
        { status: res.status },
      );
    }

    const { accessToken, refreshToken } = json.data ?? json;

    // Fetch user profile with the new token
    const profileRes = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 },
      );
    }

    const profileJson = await profileRes.json();
    const user = profileJson.data ?? profileJson;

    const response = NextResponse.json({ user });

    response.cookies.set("accessToken", accessToken, {
      ...COOKIE_BASE,
      maxAge: 900, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 604800, // 7 days
    });

    // Non-sensitive role cookie for middleware-based routing
    response.cookies.set("userRole", user.role ?? "CLIENT", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 604800,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
