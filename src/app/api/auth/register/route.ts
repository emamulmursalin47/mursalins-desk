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

    // Register user
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const registerJson = await registerRes.json();

    if (!registerRes.ok) {
      return NextResponse.json(
        { error: registerJson.message || "Registration failed" },
        { status: registerRes.status },
      );
    }

    // Auto-login after registration
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    const loginJson = await loginRes.json();

    if (!loginRes.ok) {
      // Registration succeeded but login failed — still OK, just redirect to login
      return NextResponse.json(
        { user: registerJson.data ?? registerJson },
        { status: 201 },
      );
    }

    const { accessToken, refreshToken } = loginJson.data ?? loginJson;
    const user = registerJson.data ?? registerJson;

    const response = NextResponse.json({ user }, { status: 201 });

    response.cookies.set("accessToken", accessToken, {
      ...COOKIE_BASE,
      maxAge: 900,
    });

    response.cookies.set("refreshToken", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 604800,
    });

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
