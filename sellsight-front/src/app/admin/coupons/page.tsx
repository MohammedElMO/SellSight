'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Tag, Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const COUPONS = [
  { code: 'WELCOME20',  discount: '20% off',  type: 'percent', uses: 342,  maxUses: 1000, expires: 'Jun 30, 2026', status: 'active'   },
  { code: 'FIRST10',    discount: '$10 off',  type: 'fixed',   uses: 891,  maxUses: 500,  expires: 'May 31, 2026', status: 'expired'  },
  { code: 'SUMMER30',   discount: '30% off',  type: 'percent', uses: 0,    maxUses: 500,  expires: 'Aug 01, 2026', status: 'active'   },
  { code: 'VIP50',      discount: '50% off',  type: 'percent', uses: 12,   maxUses: 50,   expires: 'May 01, 2026', status: 'active'   },
  { code: 'FLASH5',     discount: '$5 off',   type: 'fixed',   uses: 2109, maxUses: 2000, expires: 'Apr 15, 2026', status: 'expired'  },
];

export default function AdminCouponsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? COUPONS : COUPONS.filter(c => c.status === filter);

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Coupon Management</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Create and manage promotional discount codes</p>
          </div>
          <MagButton variant="primary" onClick={() => toast.info('Create coupon modal would open here')}>
            <Plus className="h-4 w-4" /> New coupon
          </MagButton>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="h-8 px-4 rounded-full text-[12px] font-medium transition-all capitalize"
              style={filter === f ? { background: 'var(--accent)', color: 'white' } : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {f}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.6fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]" style={{ background: 'var(--surface)' }}>
            <span>Code</span><span>Discount</span><span>Usage</span><span>Expires</span><span>Status</span><span></span>
          </div>
          {filtered.map((c, i) => (
            <div key={c.code} className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.6fr] gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-[var(--accent-muted)] flex items-center justify-center">
                  <Tag className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                </div>
                <span className="font-mono font-bold text-[13px] text-[var(--text-primary)]">{c.code}</span>
              </div>
              <span className="font-semibold text-[13px] text-[var(--text-primary)]">{c.discount}</span>
              <div>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{c.uses}</span>
                <span className="text-[12px] text-[var(--text-tertiary)]"> / {c.maxUses}</span>
                <div className="h-1 mt-1 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((c.uses / c.maxUses) * 100, 100)}%`, background: c.uses >= c.maxUses ? 'var(--danger)' : 'var(--accent)' }} />
                </div>
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">{c.expires}</span>
              <Pill size="sm" variant={c.status === 'active' ? 'success' : 'subtle'}>{c.status}</Pill>
              <div className="flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }} className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-xs)] hover:bg-[var(--accent-muted)] transition-colors text-[var(--text-tertiary)]">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toast.error(`Coupon ${c.code} deleted`)} className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-xs)] hover:bg-[var(--danger-muted)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--danger)]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </PageLayout>
  );
}
