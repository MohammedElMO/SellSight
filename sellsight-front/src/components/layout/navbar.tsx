'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingBag,
  Heart,
  Award,
  MapPin,
  Eye,
  Warehouse,
  Tag,
  Store,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { cn, initials } from '@/lib/utils';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/notification/notification-bell';
import { ProductSearchAutocomplete } from '@/components/product/product-search-autocomplete';
import { MiniCart } from '@/components/cart/mini-cart';

interface NavLink {
  label: string;
  href: string;
  icon?: React.ElementType;
}

function useNavLinks(): NavLink[] {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return [{ label: 'Shop', href: '/products' }];
  if (role === 'CUSTOMER')
    return [
      { label: 'Shop',      href: '/products',         icon: ShoppingBag   },
      { label: 'My Orders', href: '/orders',   icon: ClipboardList },
    ];
  if (role === 'SELLER')
    return [
      { label: 'Dashboard',   href: '/seller/dashboard', icon: LayoutDashboard },
      { label: 'My Products', href: '/seller/products',  icon: Package          },
    ];
  if (role === 'ADMIN')
    return [
      { label: 'Dashboard', href: '/admin/dashboard',        icon: LayoutDashboard },
      { label: 'Products',  href: '/admin/products',         icon: Package         },
      { label: 'Inventory', href: '/admin/inventory',        icon: Warehouse       },
      { label: 'Users',     href: '/admin/users',            icon: Users           },
      { label: 'Sessions',  href: '/admin/sessions',         icon: ShieldCheck     },
      { label: 'Coupons',   href: '/admin/coupons',          icon: Tag             },
      { label: 'Sellers',   href: '/admin/sellers/pending',  icon: Store           },
    ];
  return [];
}

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role, firstName, lastName, logout } = useAuthStore();
  const navLinks = useNavLinks();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const showCart    = role === 'CUSTOMER' || !isAuthenticated;
  const userInitials = initials(firstName, lastName);

  return (
    <nav
      className="sticky top-0 z-40 border-b border-[var(--border-subtle)]"
      style={{
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[60px] gap-5">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_4px_16px_var(--accent-glow)]"
              style={{ background: 'var(--gradient)' }}
            >
              <Eye className="h-[15px] w-[15px] text-white" />
            </div>
            <span className="font-display font-extrabold text-[19px] text-[var(--text-primary)] tracking-[-0.03em]">
              SellSight
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href + '/'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium rounded-[var(--radius-xs)] transition-all duration-150',
                    active
                      ? 'text-[var(--accent-text)] bg-[var(--accent-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]',
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4 shrink-0" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Search ── */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-4">
            <ProductSearchAutocomplete />
          </div>

          {/* ── Right actions ── */}
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />

            {showCart && <MiniCart />}

            {/* Unauthenticated */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5 ml-1">
                <Link
                  href="/login"
                  className="hidden sm:flex h-[34px] px-3.5 items-center text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-[var(--radius-xs)] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="h-[34px] px-4 flex items-center text-[13px] font-semibold text-white rounded-[var(--radius-xs)] transition-all hover:opacity-90 hover:shadow-[0_4px_16px_var(--accent-glow)]"
                  style={{ background: 'var(--gradient)' }}
                >
                  Get started
                </Link>
              </div>
            ) : (
              /* User menu */
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-[34px] px-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all"
                  aria-label="User menu"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: 'var(--gradient)', boxShadow: '0 2px 8px var(--accent-glow)' }}
                  >
                    {userInitials || <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="hidden sm:block text-[13px] font-medium text-[var(--text-primary)] max-w-[100px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-150',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-lg)] z-20 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {firstName} {lastName}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">
                          {role?.toLowerCase()}
                        </p>
                      </div>
                      <div className="p-1.5">
                        {role === 'CUSTOMER' && (
                          <>
                            <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] rounded-[var(--radius-xs)] transition-all">
                              <User className="h-4 w-4" /> Profile
                            </Link>
                            <Link href="/wishlists" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] rounded-[var(--radius-xs)] transition-all">
                              <Heart className="h-4 w-4" /> Wishlists
                            </Link>
                            <Link href="/loyalty" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] rounded-[var(--radius-xs)] transition-all">
                              <Award className="h-4 w-4" /> Loyalty & Points
                            </Link>
                            <Link href="/addresses" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] rounded-[var(--radius-xs)] transition-all">
                              <MapPin className="h-4 w-4" /> Addresses
                            </Link>
                            <div className="h-px bg-[var(--border-subtle)] my-1" />
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-muted)] rounded-[var(--radius-xs)] transition-all"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-[34px] w-[34px] flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all ml-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] py-2 flex flex-col gap-0.5 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-[var(--radius-xs)] transition-all',
                  pathname === link.href
                    ? 'text-[var(--accent-text)] bg-[var(--accent-muted)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]',
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-[var(--radius-xs)] transition-all"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
