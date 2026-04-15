'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import {
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { cn, initials } from '@/lib/utils';
import toast from 'react-hot-toast';

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
      { label: 'Shop',      href: '/products', icon: ShoppingBag  },
      { label: 'My Orders', href: '/orders',   icon: ClipboardList },
    ];
  if (role === 'SELLER')
    return [
      { label: 'Dashboard',   href: '/seller/dashboard', icon: LayoutDashboard },
      { label: 'My Products', href: '/seller/products',  icon: Package          },
    ];
  if (role === 'ADMIN')
    return [
      { label: 'Products',   href: '/admin/products', icon: Package         },
      { label: 'All Orders', href: '/admin/orders',   icon: ClipboardList   },
    ];
  return [];
}

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role, firstName, lastName, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navLinks   = useNavLinks();

  const [mobileOpen,  setMobileOpen]  = useState(false);
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
    <nav className="sticky top-0 z-40 bg-white/96 backdrop-blur-md border-b border-[#e5e4e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-6">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="font-bold text-[20px] tracking-tight text-[#111] shrink-0"
          >
            SellSight
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-[8px] transition-all duration-100',
                  pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(link.href + '/'))
                    ? 'text-[#111] bg-[#f7f6f2]'
                    : 'text-[#666] hover:text-[#111] hover:bg-[#f7f6f2]'
                )}
              >
                {link.icon && <link.icon className="h-4 w-4 shrink-0" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Cart */}
            {showCart && (
              <Link
                href="/cart"
                className="relative h-9 w-9 flex items-center justify-center rounded-[8px] text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] transition-all"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#111] text-white text-[10px] font-bold rounded-full px-1 leading-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Unauthenticated */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="hidden sm:flex h-9 px-3.5 items-center text-sm font-medium text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] rounded-[8px] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-4 flex items-center text-sm font-semibold bg-[#111] text-white rounded-[9px] hover:bg-[#2a2a2a] transition-all"
                >
                  Get started
                </Link>
              </div>
            ) : (
              /* User menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-9 px-2.5 rounded-[9px] hover:bg-[#f7f6f2] transition-all"
                  aria-label="User menu"
                >
                  <div className="h-7 w-7 rounded-full bg-[#111] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {userInitials || <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#111] max-w-[100px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-[#999] transition-transform duration-150',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#e5e4e0] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-[#f0efeb]">
                        <p className="text-sm font-semibold text-[#111]">
                          {firstName} {lastName}
                        </p>
                        <p className="text-xs text-[#999] mt-0.5 capitalize">
                          {role?.toLowerCase()}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#dc2626] hover:bg-[#fef2f2] rounded-[8px] transition-all"
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
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-[8px] text-[#666] hover:bg-[#f7f6f2] transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#f0efeb] py-2 flex flex-col gap-0.5 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-[8px] transition-all',
                  pathname === link.href
                    ? 'text-[#111] bg-[#f7f6f2]'
                    : 'text-[#666] hover:text-[#111] hover:bg-[#f7f6f2]'
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
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] rounded-[8px] transition-all"
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
