'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { AnimCounter } from '@/components/ui/anim-counter';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const PAYOUTS = [
  { id: 'PAY-001', amount: 2840, date: 'Apr 15, 2026', method: 'Bank Transfer', status: 'completed' },
  { id: 'PAY-002', amount: 1920, date: 'Apr 01, 2026', method: 'Bank Transfer', status: 'completed' },
  { id: 'PAY-003', amount: 3160, date: 'Mar 15, 2026', method: 'Bank Transfer', status: 'completed' },
  { id: 'PAY-004', amount: 2100, date: 'Mar 01, 2026', method: 'Bank Transfer', status: 'completed' },
];

export default function SellerPayoutsPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Payouts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track your earnings and withdrawal history</p>
        </div>
      </Reveal>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: DollarSign,  label: 'Available Balance', val: 4280,  prefix: '$', note: 'Ready to withdraw' },
          { icon: Clock,       label: 'Pending',           val: 1840,  prefix: '$', note: 'Processing (2-3 days)' },
          { icon: TrendingUp,  label: 'Total Paid Out',    val: 10020, prefix: '$', note: 'All time' },
        ].map((c, i) => (
          <Reveal key={c.label} delay={i * 80}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{c.label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <c.icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl text-[var(--text-primary)]">
                {c.prefix}<AnimCounter target={c.val} />
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">{c.note}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Withdraw CTA */}
      <Reveal delay={280}>
        <div
          className="rounded-[var(--radius)] p-6 mb-8 flex items-center justify-between"
          style={{ background: 'var(--gradient)' }}
        >
          <div className="text-white">
            <p className="font-display font-bold text-lg">$4,280 available</p>
            <p className="text-sm text-white/70">Instant transfer to your bank account</p>
          </div>
          <MagButton style={{ background: 'white', color: '#111', border: 'none' }}>
            Withdraw now
          </MagButton>
        </div>
      </Reveal>

      {/* Payout history */}
      <Reveal delay={360}>
        <h2 className="font-display font-semibold text-[16px] text-[var(--text-primary)] mb-4">Payout History</h2>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          {PAYOUTS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface)] transition-colors">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--success-muted)' }}>
                <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">{p.id}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{p.date} · {p.method}</p>
              </div>
              <span className="font-display font-bold text-base text-[var(--text-primary)]">${p.amount.toLocaleString()}</span>
              <Pill variant="success" size="sm">completed</Pill>
            </div>
          ))}
        </div>
      </Reveal>
    </PageLayout>
  );
}
