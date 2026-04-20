'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { TrendingUp, Package, Users, Eye, ShoppingCart, Star } from 'lucide-react';

const METRICS = [
  { icon: TrendingUp, label: 'Revenue (30d)',     val: 12480, prefix: '$', suffix: '',   change: '+18.3%',  up: true  },
  { icon: Package,    label: 'Products Listed',   val: 24,    prefix: '',  suffix: '',   change: '+3 new',  up: true  },
  { icon: ShoppingCart, label: 'Orders (30d)',    val: 89,    prefix: '',  suffix: '',   change: '+22%',    up: true  },
  { icon: Eye,        label: 'Product Views',     val: 4823,  prefix: '',  suffix: '',   change: '+11.4%',  up: true  },
  { icon: Users,      label: 'Unique Customers',  val: 67,    prefix: '',  suffix: '',   change: '+8',      up: true  },
  { icon: Star,       label: 'Avg. Rating',       val: 4,     prefix: '',  suffix: '.6', change: '+0.2',    up: true  },
];

const MONTHLY = [
  { month: 'Nov', rev: 7200,  orders: 54  },
  { month: 'Dec', rev: 9600,  orders: 71  },
  { month: 'Jan', rev: 8100,  orders: 61  },
  { month: 'Feb', rev: 10400, orders: 78  },
  { month: 'Mar', rev: 11900, orders: 88  },
  { month: 'Apr', rev: 12480, orders: 89  },
];

const maxRev = Math.max(...MONTHLY.map(m => m.rev));

export default function SellerAnalyticsPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track your store performance over time</p>
        </div>
      </Reveal>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {METRICS.map((m, i) => (
          <Reveal key={m.label} delay={i * 60}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{m.label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <m.icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-[-0.02em]">
                {m.prefix}<AnimCounter target={m.val} />{m.suffix}
              </div>
              <div className="text-[12px] font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--success)' }}>
                <TrendingUp className="h-3 w-3" /> {m.change}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Revenue chart */}
      <Reveal delay={400}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-5">Revenue (Last 6 Months)</h2>
          <div className="flex items-end gap-4 h-40">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium">${(m.rev / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-[6px] transition-all duration-700"
                  style={{
                    height: `${(m.rev / maxRev) * 100}%`,
                    background: 'var(--gradient)',
                    minHeight: 8,
                  }}
                />
                <span className="text-[11px] text-[var(--text-tertiary)]">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </PageLayout>
  );
}
