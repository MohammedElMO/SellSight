'use client';

import Link from 'next/link';
import { ShieldCheck, Users, KeyRound, AlertTriangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi, adminApi } from '@/lib/services';

export default function SuperAdminDashboard() {
  const { firstName } = useAuthStore();

  const { data: admins } = useQuery({
    queryKey: ['super-admin', 'admins'],
    queryFn: superAdminApi.listAdmins,
  });

  const pending2fa = admins?.filter(a => a.setupRequired && !a.setupApproved).length ?? 0;
  const disabled   = admins?.filter(a => a.disabled).length ?? 0;
  const locked     = admins?.filter(a => a.failed2faAttempts >= 5).length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Reveal>
        <div className="mb-8">
          <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] tracking-[-0.02em] mb-1">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Welcome back{firstName ? `, ${firstName}` : ''}. Manage admins, users, and platform security.
          </p>
        </div>
      </Reveal>

      {/* Alert strip — shows only when there are things needing attention */}
      {(pending2fa > 0 || locked > 0) && (
        <Reveal delay={40}>
          <div
            className="flex flex-wrap items-center gap-3 px-5 py-3.5 rounded-[var(--radius)] mb-6 border text-[13px] font-medium"
            style={{ background: 'rgba(239,68,68,.06)', borderColor: 'rgba(239,68,68,.25)', color: 'var(--text-primary)' }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--danger)' }} />
            <span>
              {pending2fa > 0 && <><strong>{pending2fa}</strong> admin{pending2fa !== 1 ? 's' : ''} awaiting 2FA approval</>}
              {pending2fa > 0 && locked > 0 && ' · '}
              {locked > 0 && <><strong>{locked}</strong> admin{locked !== 1 ? 's' : ''} locked (failed 2FA)</>}
            </span>
            <Link
              href="/super-admin/admins"
              className="ml-auto text-[12px] font-semibold underline underline-offset-2"
              style={{ color: 'var(--danger)' }}
            >
              Review admins →
            </Link>
          </div>
        </Reveal>
      )}

      {/* Stats mini-row */}
      {admins && (
        <Reveal delay={50}>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total admins', value: admins.length },
              { label: 'Active',       value: admins.filter(a => !a.disabled && !a.deleted).length },
              { label: 'Disabled',     value: disabled },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] px-5 py-4 text-center"
              >
                <p className="font-display font-extrabold text-2xl text-[var(--text-primary)]">{value}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Navigation cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Reveal delay={60}>
          <Link
            href="/super-admin/admins"
            className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-all hover:shadow-[0_4px_24px_var(--accent-glow)]"
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
            >
              <ShieldCheck className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Admin Management</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Create admins, manage 2FA, approve resets, disable accounts.
            </p>
            {pending2fa > 0 && (
              <span
                className="inline-block mt-3 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
              >
                {pending2fa} pending approval
              </span>
            )}
          </Link>
        </Reveal>

        <Reveal delay={80}>
          <Link
            href="/admin/users"
            className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-all hover:shadow-[0_4px_24px_var(--accent-glow)]"
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)' }}
            >
              <Users className="h-5 w-5" style={{ color: 'var(--warning)' }} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">User Management</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Search users, change roles, disable accounts, revoke sessions.
            </p>
          </Link>
        </Reveal>

        <Reveal delay={100}>
          <Link
            href="/super-admin/sessions"
            className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-all hover:shadow-[0_4px_24px_var(--accent-glow)]"
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
            >
              <KeyRound className="h-5 w-5" style={{ color: 'var(--success)' }} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Session Management</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Monitor and revoke active sessions across all users platform-wide.
            </p>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
