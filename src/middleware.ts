import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    // Protect Editor/Admin dashboard routes
    if (pathname.startsWith("/dashboard/editor")) {
      if (role !== "EDITOR" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }

    // Protect Reporter+ dashboard routes
    if (pathname.startsWith("/dashboard/reporter")) {
      if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }

    // Protect Admin dashboard routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/reporter/:path*", "/dashboard/editor/:path*", "/dashboard/admin/:path*"],
};
