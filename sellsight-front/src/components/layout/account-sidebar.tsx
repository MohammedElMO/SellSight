'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { initials } from '@/lib/utils';
import { User, ClipboardList, MapPin, Heart, Award, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { href: '/profile',       label: 'My Profile',       icon: User         },
  { href: '/orders',        label: 'Order History',    icon: ClipboardList },
  { href: '/addresses',     label: 'Addresses',        icon: MapPin       },
  { href: '/wishlists',     label: 'Wishlists',        icon: Heart        },
  { href: '/loyalty',       label: 'Loyalty & Rewards',icon: Award        },
  { href: '/notifications',    label: 'Notifications',    icon: Bell         },
  { href: '/change-password', label: 'Security',          icon: ShieldCheck  },
];

export function AccountSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { firstName, lastName, email, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <div className="w-full md:w-[240px] shrink-0">
      {/* Avatar card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-4 text-center">
        <div
          className="h-16 w-16 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold mb-3"
          style={{ background: 'var(--gradient)', boxShadow: '0 6px 24px var(--accent-glow)' }}
        >
          {initials(firstName, lastName) || <User className="h-7 w-7" />}
        </div>
        <h2 className="font-display font-bold text-[15px] text-[var(--text-primary)]">
          {firstName} {lastName}
        </h2>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 truncate">{email}</p>
      </div>

      {/* Nav */}
      <nav className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden p-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all"
              style={isActive
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ''; }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="h-px mx-4 my-1" style={{ background: 'var(--border-subtle)' }} />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all text-left w-full"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}
