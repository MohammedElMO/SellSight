import { NextRequest, NextResponse } from 'next/server';

// app_session cookie format: "ROLE|emailVerified|sellerStatus"
// Set by the backend on every auth response — contains only routing metadata, no secrets.
// The actual JWT lives in the HttpOnly app_token cookie and is never readable here.
interface SessionPayload {
  role: string;
  emailVerified: boolean;
  sellerStatus: string | null;
}

function parseSession(value: string): SessionPayload | null {
  try {
    const parts = value.split('|');
    if (parts.length < 2 || !parts[0]) return null;
    const [role, emailVerifiedStr, sellerStatus] = parts;
    return {
      role,
      emailVerified: emailVerifiedStr === 'true',
      sellerStatus: sellerStatus || null,
    };
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

  const sessionStr    = request.cookies.get('app_session')?.value ?? null;
  const session       = sessionStr ? parseSession(sessionStr) : null;
  const role          = session?.role ?? null;
  const emailVerified = session?.emailVerified ?? false;
  const sellerStatus  = session?.sellerStatus ?? null;
  const authed        = !!role;
  const roleHome      = role ? (ROLE_HOME[role] ?? '/') : '/login';

  function redirectTo(path: string) {
    return NextResponse.redirect(new URL(path, request.url));
  }

  // Always pass through — OAuth exchange, verification, seller-pending, and account-status screens
  if (
    pathname.startsWith('/oauth/callback') ||
    pathname === '/pending-verification' ||
    pathname === '/verify-email' ||
    pathname === '/seller/pending-approval' ||
    pathname === '/account-suspended' ||
    pathname === '/account-deleted'
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
    // Pending sellers can only see the pending-approval page (handled above)
    if (role === 'SELLER' && sellerStatus === 'PENDING') return redirectTo('/seller/pending-approval');
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
  matcher: ['/((?!_next/static|_next/image|icon.svg).*)'],
};
