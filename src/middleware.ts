import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1. Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: http:;
    connect-src 'self' https://api.cloudinary.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  res.headers.set('Content-Security-Policy', cspHeader);
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  const pathname = req.nextUrl.pathname;

  // Rate Limiting Basics
  if (pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khabar24times.in');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }

  // 2. Authentication and Authorization for Dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req });
    
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role;

    if (pathname.startsWith("/dashboard/editor") && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }

    if (pathname.startsWith("/dashboard/reporter") && role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }

    if (pathname.startsWith("/dashboard/admin")) {
      const allowedEditorRoutes = [
        "/dashboard/admin/homepage",
        "/dashboard/admin/kanban",
        "/dashboard/admin/planning",
      ];
      const isEditorAllowedSubroute = allowedEditorRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (role !== "ADMIN" && !(role === "EDITOR" && isEditorAllowedSubroute)) {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
