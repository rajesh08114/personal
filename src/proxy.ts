import { NextResponse, type NextRequest } from 'next/server';

/**
 * Sets the Content-Security-Policy and the other security headers on every page, with a fresh nonce
 * so Next.js's own inline scripts can run while everything else stays blocked. The API and media
 * routes are excluded: they send JSON and files, and proxying would buffer their upload bodies.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get('__Host-session')?.value || request.cookies.get('session')?.value,
  );

  // If user is already signed in and visits login or register, redirect to dashboard
  if (hasSession && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is signed out and visits private account routes, redirect to login
  if (
    process.env.NEXT_PUBLIC_BIRTHDAY_API_URL &&
    !hasSession &&
    (pathname === '/dashboard' || pathname === '/profile')
  ) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== 'production';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'microphone=(self), camera=(), geolocation=(), payment=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (process.env.PUBLIC_ORIGIN?.trim().startsWith('https:')) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api/|media/|_next/static|_next/image|favicon.svg|manifest.webmanifest).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
};
