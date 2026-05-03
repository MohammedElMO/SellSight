'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <Reveal className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center shadow-lg">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--gradient)' }}>
              <span className="text-white text-[14px] font-bold">S</span>
            </div>
            <span className="font-display font-extrabold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">SellSight</span>
          </div>

          {/* Icon */}
          <div
            className="mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)' }}
          >
            <Trash2 className="h-10 w-10" style={{ color: 'var(--danger)' }} />
          </div>

          <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-3">
            Account deleted
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-8">
            This account has been permanently deleted and can no longer be accessed.
            If you believe this is a mistake, please contact our support team.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="w-full py-2.5 rounded-[var(--radius-md)] font-semibold text-[14px] text-white flex items-center justify-center"
              style={{ background: 'var(--gradient)' }}
            >
              Create a new account
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-[var(--radius-md)] font-semibold text-[14px] text-[var(--text-secondary)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
