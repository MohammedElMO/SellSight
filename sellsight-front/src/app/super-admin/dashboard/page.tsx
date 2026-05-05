'use client';

import Link from 'next/link';
import { ShieldCheck, Users } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { useAuthStore } from '@/store/auth';

export default function SuperAdminDashboard() {
  const { firstName } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Reveal>
        <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] tracking-[-0.02em] mb-1">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Welcome back{firstName ? `, ${firstName}` : ''}. Manage admins and platform security below.
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 gap-4">
        <Reveal delay={60}>
          <Link href="/super-admin/admins" className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-colors">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mb-4" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Admin Management</p>
            <p className="text-xs text-[var(--text-secondary)]">View all admins, manage 2FA setup, approve resets, disable accounts.</p>
          </Link>
        </Reveal>

        <Reveal delay={100}>
          <Link href="/admin/sessions" className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-colors">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mb-4" style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}>
              <ShieldCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Session Management</p>
            <p className="text-xs text-[var(--text-secondary)]">View and revoke sessions across all users.</p>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
