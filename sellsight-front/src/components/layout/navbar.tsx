'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LogOut, ShoppingBag, LayoutDashboard, Package, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, role, firstName, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0"
         style={{ borderRadius: 0 }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gradient-text no-underline">
          SellSight
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Role-specific nav links */}
              {role === 'CUSTOMER' && (
                <>
                  <Link href="/products" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <ShoppingBag size={16} /> Products
                  </Link>
                  <Link href="/orders/my" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <ClipboardList size={16} /> My Orders
                  </Link>
                </>
              )}
              {role === 'SELLER' && (
                <>
                  <Link href="/seller/dashboard" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/seller/products" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <Package size={16} /> My Products
                  </Link>
                </>
              )}
              {role === 'ADMIN' && (
                <>
                  <Link href="/admin/dashboard" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/admin/products" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <Package size={16} /> Products
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                    <ClipboardList size={16} /> Orders
                  </Link>
                </>
              )}

              {/* User info + logout */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">
                  {firstName} <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] ml-1">{role}</span>
                </span>
                <button onClick={handleLogout} className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2 no-underline">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
