import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lessons/:path*',
    '/lesson-player/:path*',
    '/assessments/:path*',
    '/capstone/:path*',
    '/certification/:path*',
    '/marketplace/:path*',
    '/admin/:path*',
    '/community/new',
    '/community/edit/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Allow public routes
  if (pathname.startsWith('/certification/verify') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Enforce platform session token check
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    // For community routes, redirect with ?redirect= to the community login page
    if (pathname.startsWith('/community/')) {
      const redirectUrl = new URL('/community/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Query Node.js API session checker
    const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
      headers: {
        cookie: `session_token=${token}`,
      },
    });

    if (!sessionRes.ok) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('session_token');
      return res;
    }

    const auth = await sessionRes.json();

    if (!auth.success) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('session_token');
      return res;
    }

    const { role, mustReset } = auth;

    // Role-Based Authorization Checks
    // 1. /admin/* -> admin only
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. /marketplace/* -> employer or admin only
    if (pathname.startsWith('/marketplace') && role !== 'employer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. /community/new and /community/edit/* -> admin or employee only
    if ((pathname === '/community/new' || pathname.startsWith('/community/edit/')) && 
        role !== 'admin' && role !== 'employee') {
      return NextResponse.redirect(new URL('/community', request.url));
    }

    // 4. /dashboard, /lessons, /lesson-player, /assessments, /capstone, /certification -> learner or admin
    const learnerRoutes = ['/dashboard', '/lessons', '/lesson-player', '/assessments', '/capstone', '/certification'];
    if (learnerRoutes.some(route => pathname.startsWith(route)) && role !== 'learner' && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Force password reset redirection
    if (mustReset && !pathname.startsWith('/reset-password')) {
      return NextResponse.redirect(new URL('/reset-password/request', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session_token');
    return res;
  }
}
