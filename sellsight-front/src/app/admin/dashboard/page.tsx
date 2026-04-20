'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { useAllOrders } from '@/lib/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  TrendingUp, Package, Users,
  ArrowRight, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { icon: TrendingUp,   label: 'Revenue Today',   val: 142847, prefix: '$', suffix: '',    change: '+23.5%' },
  { icon: Package,      label: 'Products Listed',  val: 160482, prefix: '',  suffix: '',    change: '+1,204 new' },
  { icon: Users,        label: 'Active Users',     val: 84291,  prefix: '',  suffix: '',    change: '+12.8%' },
];

const ALERTS = [
  { type: 'warning', msg: '3 seller applications pending review',         link: '/admin/sellers/pending'  },
  { type: 'danger',  msg: '7 products flagged for moderation',            link: '/admin/products/flagged' },
  { type: 'warning', msg: '2 reviews reported as inappropriate',          link: '/admin/reviews/flagged'  },
];

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading } = useAllOrders();
  const recentOrders = (ordersData ?? []).slice(0, 5);

  return (
    <PageLayout raw>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-10">
        <Reveal>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-[32px] text-[var(--text-primary)] tracking-[-0.03em]">Admin Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Platform overview and system health</p>
            </div>
            <Link href="/admin/analytics">
              <MagButton variant="secondary" size="sm">
                Full analytics <ArrowRight className="h-3.5 w-3.5" />
              </MagButton>
            </Link>
          </div>
        </Reveal>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{s.label}</span>
                  <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                    <s.icon className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                </div>
                <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-[-0.02em]">
                  {s.prefix}<AnimCounter target={s.val} />{s.suffix}
                </div>
                <div className="text-[12px] font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--success)' }}>
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
          {/* Recent orders */}
          <Reveal delay={320}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Recent Orders</h2>
                <Link href="/admin/orders" className="text-[12px] text-[var(--accent-text)] hover:underline font-medium">View all →</Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 skeleton rounded-[var(--radius-xs)]" />)}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr] gap-3 py-2 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    <span>Order</span><span>Total</span><span>Items</span><span>Status</span>
                  </div>
                  {recentOrders.map(o => (
                    <div key={o.id} className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr] gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] -mx-5 px-5 transition-colors cursor-pointer">
                      <span className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">#{o.id.toString().slice(-6)}</span>
                      <span className="font-display font-bold text-[13px] text-[var(--text-primary)]">{formatPrice(o.total)}</span>
                      <span className="text-[13px] text-[var(--text-secondary)]">{o.items.length}</span>
                      <Pill size="sm" variant={o.status === 'DELIVERED' ? 'success' : o.status === 'CANCELLED' ? 'danger' : 'accent'}>
                        {o.status.toLowerCase()}
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Alerts */}
          <Reveal delay={400}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-4">Alerts & Actions</h2>
              <div className="space-y-3">
                {ALERTS.map((a, i) => (
                  <Link key={i} href={a.link}
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors group"
                  >
                    {a.type === 'danger'  && <AlertTriangle className="h-4 w-4 text-[var(--danger)] mt-0.5 flex-none" />}
                    {a.type === 'warning' && <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-none" />}
                    <p className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-snug">
                      {a.msg}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageLayout>
  );
}
