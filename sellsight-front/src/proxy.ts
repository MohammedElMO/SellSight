import { NextRequest, NextResponse } from 'next/server';

// Payload is decoded without signature verification — used only for routing.
// Spring Boot verifies the signature on every API call.
interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
  emailVerified?: boolean;
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

  const isExpired     = payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
  const role          = (!isExpired && payload?.role) ? payload.role : null;
  const emailVerified = (!isExpired && payload?.emailVerified) ?? false;
  const authed        = !!role;
  const roleHome      = role ? (ROLE_HOME[role] ?? '/') : '/login';

  function redirectTo(path: string) {
    return NextResponse.redirect(new URL(path, request.url));
  }

  // Always pass through — OAuth exchange and verification screens
  if (
    pathname.startsWith('/oauth/callback') ||
    pathname === '/pending-verification' ||
    pathname === '/verify-email'
  ) {
    return NextResponse.next();
  }

  // Authed users shouldn't land on login/register
  if (pathname === '/login' || pathname === '/register') {
    if (authed) return redirectTo(roleHome);
    return NextResponse.next();
  }

  // Authenticated but unverified → hold at pending-verification for all
  // routes that require a login (orders, seller/*, admin/*)
  const requiresAuth =
    pathname === '/orders' ||
    pathname.startsWith('/orders/') ||
    pathname.startsWith('/seller/') ||
    pathname.startsWith('/admin/');

  if (authed && requiresAuth && !emailVerified) {
    return redirectTo('/pending-verification');
  }

  // Cart: sellers/admins don't shop
  if (pathname === '/cart' || pathname.startsWith('/cart/')) {
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  // Orders: customers only
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    if (!authed)                               return redirectTo('/login');
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  // Seller routes: authenticated sellers or admins
  if (pathname.startsWith('/seller/')) {
    if (!authed)             return redirectTo('/login');
    if (role === 'CUSTOMER') return redirectTo('/products');
    return NextResponse.next();
  }

  // Admin routes: authenticated admins only
  if (pathname.startsWith('/admin/')) {
    if (!authed)          return redirectTo('/login');
    if (role !== 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
