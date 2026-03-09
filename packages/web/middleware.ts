import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of paths that were previously in (app) and now in Student/
  const studentPaths = [
    '/dashboard',
    '/Myskills',
    '/progress',
    '/reports',
    '/settings'
  ];

  if (studentPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.redirect(new URL(`/Student${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/Myskills/:path*',
    '/progress/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ],
};
