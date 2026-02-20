import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

const PROTECTED_PATHS = ["/portal", "/dashboard"];
const AUTH_PATHS = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API Proxy: rewrite /api/proxy/* → backend with auth header ──
  if (pathname.startsWith("/api/proxy/")) {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const backendPath = pathname.replace("/api/proxy", "");
    const backendUrl = new URL(`${API_URL}${backendPath}${req.nextUrl.search}`);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("Authorization", `Bearer ${token}`);
    requestHeaders.delete("cookie");

    const response = NextResponse.rewrite(backendUrl, {
      request: { headers: requestHeaders },
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  // ── Auth routing ──
  const hasToken = req.cookies.has("accessToken");
  const userRole = req.cookies.get("userRole")?.value;

  // Protect /portal/* and /dashboard/* — redirect to login if no token
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!hasToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // /dashboard/* is ADMIN-only — redirect CLIENT users to /portal
    if (pathname.startsWith("/dashboard") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  // If already logged in, redirect away from auth pages based on role
  if (AUTH_PATHS.some((p) => pathname === p)) {
    if (hasToken) {
      const dest = userRole === "ADMIN" ? "/dashboard" : "/portal";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/proxy/:path*",
    "/portal/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
