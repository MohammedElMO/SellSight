import { NextRequest, NextResponse } from 'next/server';

interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: '/products',
  SELLER:   '/seller/dashboard',
  ADMIN:    '/admin/orders',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token   = request.cookies.get('app_token')?.value ?? null;
  const payload = token ? parseJwt(token) : null;

  const isExpired = payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
  const role      = (!isExpired && payload?.role) ? payload.role : null;
  const authed    = !!role;
  const roleHome  = role ? (ROLE_HOME[role] ?? '/') : '/login';

  function redirectTo(path: string) {
    return NextResponse.redirect(new URL(path, request.url));
  }

  if (pathname.startsWith('/oauth/callback')) {
    return NextResponse.next();
  }

  if (pathname === '/login' || pathname === '/register') {
    if (authed) return redirectTo(roleHome);
    return NextResponse.next();
  }

  if (pathname === '/cart') {
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    if (!authed)                              return redirectTo('/login');
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  if (pathname.startsWith('/seller/')) {
    if (!authed)           return redirectTo('/login');
    if (role === 'CUSTOMER') return redirectTo('/products');
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin/')) {
    if (!authed)         return redirectTo('/login');
    if (role !== 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
