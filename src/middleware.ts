import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that strictly require authentication
const PROTECTED_ROUTES = [
  '/onboarding',
  '/dashboard',
  '/profile',
  '/skill-passport/my',
  '/credentials',
  '/my-learning',
  '/skill-growth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all Next.js internals, static assets, API routes, and public files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // files with extensions (css, js, svg, ico, png, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    // Check for auth cookies (custom seva token or Supabase session tokens)
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(
      (c) =>
        c.name === 'seva-auth-token' ||
        c.name === 'sb-auth-session' ||
        (c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
    );

    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Scope middleware strictly to protected routes.
   * This guarantees static assets, chunks, CSS, API routes, and public pages are never intercepted.
   */
  matcher: [
    '/onboarding',
    '/onboarding/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/skill-passport/my',
    '/skill-passport/my/:path*',
    '/credentials',
    '/credentials/:path*',
    '/my-learning',
    '/my-learning/:path*',
    '/skill-growth',
    '/skill-growth/:path*',
  ],
};

