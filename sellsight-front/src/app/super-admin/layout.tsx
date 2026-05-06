'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { Eye, LogOut, ChevronRight, ShieldCheck, Users, KeyRound, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Admins',    href: '/super-admin/admins',    icon: ShieldCheck     },
  { label: 'Users',     href: '/admin/users',            icon: Users           },
  { label: 'Sessions',  href: '/admin/sessions',          icon: KeyRound        },
] as const;

function SuperAdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { firstName, lastName, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/login');
  };

  // Build breadcrumb: find the matching nav item for the current path
  const currentItem = NAV_ITEMS.find(
    (item) => item.href !== '/super-admin/dashboard' && pathname.startsWith(item.href)
  );

  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'SA';

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'var(--bg-nav)',
        borderColor: 'var(--border-subtle)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[60px] gap-4">

          {/* Logo / Home */}
          <Link href="/super-admin/dashboard" className="flex items-center gap-2.5 shrink-0 group">
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

          {/* Breadcrumb */}
          {currentItem && (
            <div className="flex items-center gap-1.5 text-[13px]">
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)] font-medium">{currentItem.label}</span>
            </div>
          )}

          {/* Nav pills */}
          <div className="hidden md:flex items-center gap-0.5 ml-4">
            {NAV_ITEMS.filter(i => i.href !== '/super-admin/dashboard').map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium rounded-[var(--radius-xs)] transition-all duration-150',
                    active
                      ? 'text-[var(--accent-text)] bg-[var(--accent-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right — role badge + logout */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: 'var(--gradient)', boxShadow: '0 2px 8px var(--accent-glow)' }}
              >
                {initials}
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-none">
                  {firstName} {lastName}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-none mt-0.5 uppercase tracking-wider">
                  Super Admin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 h-[34px] px-3 text-[12px] font-medium rounded-[var(--radius-xs)] transition-all border"
              style={{
                color: 'var(--danger)',
                borderColor: 'var(--danger-muted)',
                background: 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'SUPER_ADMIN') {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated || role !== 'SUPER_ADMIN') return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SuperAdminTopBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
