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
    // Separate login redirections based on route context
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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

    const isInternalAdmin = pathname.startsWith('/admin');
    const isCommunityProtected = pathname.startsWith('/community/');

    if (!sessionRes.ok) {
      const fallbackLogin = isInternalAdmin ? '/admin/login' : isCommunityProtected ? '/community/login' : '/login';
      const res = NextResponse.redirect(new URL(fallbackLogin, request.url));
      res.cookies.delete('session_token');
      return res;
    }

    const auth = await sessionRes.json();

    if (!auth.success) {
      const fallbackLogin = isInternalAdmin ? '/admin/login' : isCommunityProtected ? '/community/login' : '/login';
      const res = NextResponse.redirect(new URL(fallbackLogin, request.url));
      res.cookies.delete('session_token');
      return res;
    }

    const { role, mustReset } = auth;

    // Role-Based Authorization Checks
    // 1. /admin/* -> admin, employee, or teacher
    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'employee' && role !== 'teacher') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. /marketplace/* -> employer, admin, employee, or teacher
    if (pathname.startsWith('/marketplace') && role !== 'employer' && role !== 'admin' && role !== 'employee' && role !== 'teacher') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. /community/new and /community/edit/* -> admin, employee, or teacher
    if ((pathname === '/community/new' || pathname.startsWith('/community/edit/')) && 
        role !== 'admin' && role !== 'employee' && role !== 'teacher') {
      return NextResponse.redirect(new URL('/community', request.url));
    }

    // 4. /dashboard, /lessons, /lesson-player, /assessments, /capstone, /certification -> all authenticated roles
    const learnerRoutes = ['/dashboard', '/lessons', '/lesson-player', '/assessments', '/capstone', '/certification'];
    if (learnerRoutes.some(route => pathname.startsWith(route)) && !['learner', 'admin', 'employee', 'teacher'].includes(role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Force password reset redirection
    if (mustReset && !pathname.startsWith('/reset-password')) {
      return NextResponse.redirect(new URL('/reset-password/request', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const isInternalAdmin = pathname.startsWith('/admin');
    const isCommunityProtected = pathname.startsWith('/community/');
    const fallbackLogin = isInternalAdmin ? '/admin/login' : isCommunityProtected ? '/community/login' : '/login';
    const res = NextResponse.redirect(new URL(fallbackLogin, request.url));
    res.cookies.delete('session_token');
    return res;
  }
}
