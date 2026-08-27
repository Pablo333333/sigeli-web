import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('talento_token')?.value;
  const { pathname } = request.nextUrl;

  // Manejo de la raíz (/)
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const isAuthPage = pathname.startsWith('/login');
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};
