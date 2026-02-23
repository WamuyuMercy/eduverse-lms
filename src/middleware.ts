// =============================================================
// Next.js Middleware - Role-Based Access Control
// =============================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: Record<string, unknown> | null } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If no token, withAuth will redirect to /login automatically
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;

    // ── Admin routes ──────────────────────────────────────────
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ── Teacher routes ────────────────────────────────────────
    if (
      pathname.startsWith("/teacher") &&
      role !== "TEACHER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ── Student routes ────────────────────────────────────────
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};
