'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { AlertTriangle, Package, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FLAGGED = [
  { id: 'p1', name: 'Suspicious Electronics Bundle',    seller: 'FastDeals99',  reason: 'Counterfeit suspicion', flags: 12, date: 'Apr 16' },
  { id: 'p2', name: 'Health Supplement - Bold Claims',  seller: 'NutriMax',     reason: 'False advertising',     flags: 8,  date: 'Apr 15' },
  { id: 'p3', name: 'Designer Bag Replica',             seller: 'LuxDeals',     reason: 'Copyright violation',   flags: 24, date: 'Apr 14' },
  { id: 'p4', name: 'Unlicensed Software Suite',        seller: 'SoftPro',      reason: 'IP infringement',       flags: 5,  date: 'Apr 14' },
  { id: 'p5', name: 'Misleading AI Product',            seller: 'TechTrend',    reason: 'False specifications',  flags: 3,  date: 'Apr 13' },
  { id: 'p6', name: 'Unverified Medical Device',        seller: 'HealthFirst',  reason: 'Regulatory concern',    flags: 9,  date: 'Apr 13' },
  { id: 'p7', name: 'Expired Goods Listing',            seller: 'QuickShop',    reason: 'Safety hazard',         flags: 6,  date: 'Apr 12' },
];

export default function FlaggedProductsPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Product Moderation</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{FLAGGED.length} products flagged for review</p>
        </div>
      </Reveal>

      <div className="space-y-3">
        {FLAGGED.map((p, i) => (
          <Reveal key={p.id} delay={i * 50}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[var(--radius-xs)] bg-[var(--danger-muted)] flex items-center justify-center flex-none">
                <Package className="h-5 w-5 text-[var(--danger)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] text-[var(--text-primary)] truncate">{p.name}</p>
                <p className="text-[12px] text-[var(--text-secondary)]">by {p.seller} · {p.date}</p>
              </div>
              <Pill variant="danger" size="sm">{p.reason}</Pill>
              <div className="flex items-center gap-1 text-[12px] text-[var(--danger)] font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> {p.flags} flags
              </div>
              <div className="flex gap-2 shrink-0">
                <MagButton size="sm" variant="ghost" onClick={() => toast.info(`Reviewing ${p.name}`)}>
                  <Eye className="h-3.5 w-3.5" /> Review
                </MagButton>
                <MagButton size="sm" variant="danger" onClick={() => toast.success(`${p.name} removed`)}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </MagButton>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageLayout>
  );
}
