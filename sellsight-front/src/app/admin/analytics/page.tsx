'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { TrendingUp, Users, ShoppingCart, DollarSign, Globe, Package } from 'lucide-react';

const METRICS = [
  { icon: DollarSign,  label: 'Total Revenue',    val: 2847392, prefix: '$', suffix: '',   change: '+31.2% YoY' },
  { icon: Users,       label: 'Total Users',       val: 84291,   prefix: '',  suffix: '',   change: '+15.8% MoM' },
  { icon: ShoppingCart,label: 'Orders This Month', val: 9842,    prefix: '',  suffix: '',   change: '+22.1%'     },
  { icon: Package,     label: 'Active Products',   val: 160482,  prefix: '',  suffix: '',   change: '+8.4%'      },
  { icon: TrendingUp,  label: 'Avg. Order Value',  val: 94,      prefix: '$', suffix: '.50',change: '+5.2%'      },
  { icon: Globe,       label: 'Countries',          val: 47,      prefix: '',  suffix: '',   change: '+4 new'     },
];

const REVENUE = [
  { month: 'Nov', rev: 198000 }, { month: 'Dec', rev: 312000 },
  { month: 'Jan', rev: 244000 }, { month: 'Feb', rev: 287000 },
  { month: 'Mar', rev: 341000 }, { month: 'Apr', rev: 398000 },
];

const TOP_CATS = [
  { cat: 'Electronics', pct: 34, rev: 136000 },
  { cat: 'Fashion',     pct: 22, rev: 87000  },
  { cat: 'Home',        pct: 18, rev: 71600  },
  { cat: 'Sports',      pct: 14, rev: 55700  },
  { cat: 'Beauty',      pct: 8,  rev: 31800  },
  { cat: 'Books',       pct: 4,  rev: 15900  },
];

const maxRev = Math.max(...REVENUE.map(r => r.rev));

export default function AdminAnalyticsPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Platform Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Comprehensive platform performance metrics</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
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
              <div className="text-[12px] font-medium mt-1" style={{ color: 'var(--success)' }}>{m.change}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <Reveal delay={400}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-5">Monthly Revenue</h2>
            <div className="flex items-end gap-4 h-40">
              {REVENUE.map(r => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[var(--text-tertiary)]">${(r.rev / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t-[6px]" style={{ height: `${(r.rev / maxRev) * 100}%`, background: 'var(--gradient)', minHeight: 8 }} />
                  <span className="text-[11px] text-[var(--text-tertiary)]">{r.month}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={480}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-5">Revenue by Category</h2>
            <div className="space-y-3">
              {TOP_CATS.map(c => (
                <div key={c.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">{c.cat}</span>
                    <span className="text-[12px] text-[var(--text-secondary)]">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </PageLayout>
  );
}
