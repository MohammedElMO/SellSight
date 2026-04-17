import { NextRequest, NextResponse } from 'next/server';

// ── JWT payload decode (no secret — used only for routing) ───
// The Edge runtime doesn't have Node's Buffer, so we use atob().
// Signature verification is handled by the Spring Boot backend on
// every actual API call; here we only need the role + expiry.

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

// ── Role → default home ──────────────────────────────────────

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: '/products',
  SELLER:   '/seller/dashboard',
  ADMIN:    '/admin/orders',
};

// ── Middleware ───────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token   = request.cookies.get('app_token')?.value ?? null;
  const payload = token ? parseJwt(token) : null;

  // Treat the session as expired if the JWT exp has passed
  const isExpired = payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
  const role      = (!isExpired && payload?.role) ? payload.role : null;
  const authed    = !!role;
  const roleHome  = role ? (ROLE_HOME[role] ?? '/') : '/login';

  function redirectTo(path: string) {
    return NextResponse.redirect(new URL(path, request.url));
  }

  // ── /oauth/callback ──────────────────────────────────────
  // Always allow — handles the OAuth code exchange.
  if (pathname.startsWith('/oauth/callback')) {
    return NextResponse.next();
  }

  // ── /login and /register ────────────────────────────────
  // Authenticated users have no reason to be here — send them home.
  if (pathname === '/login' || pathname === '/register') {
    if (authed) return redirectTo(roleHome);
    return NextResponse.next();
  }

  // ── /cart ───────────────────────────────────────────────
  // Sellers and admins cannot have a cart.
  if (pathname === '/cart') {
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  // ── /orders and /orders/* ───────────────────────────────
  // Customer-only; sellers/admins get redirected to their area.
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    if (!authed)                              return redirectTo('/login');
    if (role === 'SELLER' || role === 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  // ── /seller/* ───────────────────────────────────────────
  // Sellers and admins only.
  if (pathname.startsWith('/seller/')) {
    if (!authed)           return redirectTo('/login');
    if (role === 'CUSTOMER') return redirectTo('/products');
    return NextResponse.next();
  }

  // ── /admin/* ────────────────────────────────────────────
  // Admins only.
  if (pathname.startsWith('/admin/')) {
    if (!authed)         return redirectTo('/login');
    if (role !== 'ADMIN') return redirectTo(roleHome);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
