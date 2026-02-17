import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/portal", "/dashboard"];
const AUTH_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
  matcher: ["/portal/:path*", "/dashboard/:path*", "/login", "/register"],
};
