import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update the Supabase session
  const supabaseResponse = await updateSession(request);

  // Initialize Supabase client to check user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          // Placeholder as updateSession already handles cookie updates
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // 1. Protect routes: Redirect to login if not authenticated
  const protectedPaths = ['/admin', '/mentor', '/Student', '/dashboard'];
  const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isProtectedPath && !user) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // 1.1 Role Protection: Ensure users can only access their respective role sections
  if (user) {
    const role = user.user_metadata?.role || 'Student';
    
    // Admin has complete access, so we only need to restrict non-admins from /admin
    // and restrict others from their respective non-role sections.
    
    if (pathname.startsWith('/admin') && role !== 'Admin') {
      // Non-admins redirected to their appropriate dashboard
      return NextResponse.redirect(new URL(role === 'Mentor' ? '/mentor/notifications' : '/Student/dashboard', request.url));
    }
    
    if (pathname.startsWith('/mentor') && role !== 'Mentor' && role !== 'Admin') {
      // Only Mentors and Admins can access mentor section
      return NextResponse.redirect(new URL(role === 'Student' ? '/Student/dashboard' : '/admin/students', request.url));
    }

    if (pathname.startsWith('/Student') && role !== 'Student' && role !== 'Admin') {
      // Only Students and Admins can access student section
      return NextResponse.redirect(new URL(role === 'Mentor' ? '/mentor/notifications' : '/admin/students', request.url));
    }
  }

  // 2. Auth redirect: Redirect to dashboard if already authenticated and on login/signup page
  const authPaths = ['/', '/signup'];
  const isAuthPath = authPaths.includes(pathname);

  if (isAuthPath && user) {
    const role = user.user_metadata?.role || 'Student';
    let redirectUrl = '/Student/dashboard';
    if (role === 'Admin') redirectUrl = '/admin/students';
    if (role === 'Mentor') redirectUrl = '/mentor/notifications';
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // 3. Legacy path redirections for Students
  const studentPaths = [
    '/dashboard',
    '/Myskills',
    '/progress',
    '/reports',
    '/settings'
  ];

  if (studentPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    const url = new URL(`/Student${pathname}`, request.url);
    const redirectResponse = NextResponse.redirect(url);
    
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }

  return supabaseResponse;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

