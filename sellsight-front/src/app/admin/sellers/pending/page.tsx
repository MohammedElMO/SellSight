'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Store, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PENDING_SELLERS = [
  { id: 's1', name: 'Maria Santos',  email: 'maria@crafts.com',  store: 'HandmadeByCraft',  applied: 'Apr 16, 2026', category: 'Handmade' },
  { id: 's2', name: 'Tom Zhang',     email: 'tom@techstore.io',  store: 'TechZone Pro',      applied: 'Apr 17, 2026', category: 'Electronics' },
  { id: 's3', name: 'Amina Diallo',  email: 'amina@fashion.ng',  store: 'AminaDrapes',       applied: 'Apr 17, 2026', category: 'Fashion' },
];

export default function PendingSellersPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Seller Applications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{PENDING_SELLERS.length} applications awaiting review</p>
        </div>
      </Reveal>

      <div className="space-y-4">
        {PENDING_SELLERS.map((s, i) => (
          <Reveal key={s.id} delay={i * 80}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-[var(--radius)] flex items-center justify-center flex-none" style={{ background: 'var(--accent-muted)' }}>
                <Store className="h-5 w-5 text-[var(--accent-text)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[14px] text-[var(--text-primary)]">{s.name}</p>
                  <Pill variant="accent" size="sm">{s.category}</Pill>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">{s.store} · {s.email}</p>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Applied {s.applied}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <MagButton
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.error(`${s.name}'s application rejected`)}
                  className="text-[var(--danger)] border-[var(--danger-border)] hover:bg-[var(--danger-muted)]"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </MagButton>
                <MagButton
                  variant="primary"
                  size="sm"
                  onClick={() => toast.success(`${s.name} approved as seller!`)}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </MagButton>
              </div>
            </div>
          </Reveal>
        ))}

        {PENDING_SELLERS.length === 0 && (
          <div className="text-center py-20">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-[var(--success)]" />
            <p className="font-medium text-[var(--text-primary)]">All caught up!</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">No pending seller applications</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
