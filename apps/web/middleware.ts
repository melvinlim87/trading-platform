import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Define paths
    const authRoutes = ['/auth/login', '/auth/register'];
    const publicRoutes = ['/', ...authRoutes]; // Landing page is public
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/static'));

    // 1. Redirect to dashboard if logged in and trying to access auth pages
    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Redirect to login if not logged in and trying to access protected pages
    // Check if path is NOT public (meaning it IS protected)
    if (!token && !isPublicRoute) {
        // Allow access to static assets and api routes
        if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api') || pathname.includes('.')) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
