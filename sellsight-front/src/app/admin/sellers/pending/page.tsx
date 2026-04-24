'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, CheckCircle, XCircle } from 'lucide-react';
import { usePendingSellers, useApproveSeller, useRejectSeller } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import type { SellerApplicationDto } from '@shared/types';

function SellerCard({ seller }: { seller: SellerApplicationDto }) {
  const { mutate: approve, isPending: approving } = useApproveSeller();
  const { mutate: reject,  isPending: rejecting  } = useRejectSeller();

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-center gap-5">
      <div
        className="w-12 h-12 rounded-[var(--radius)] flex items-center justify-center flex-none"
        style={{ background: 'var(--accent-muted)' }}
      >
        <Store className="h-5 w-5 text-[var(--accent-text)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-[14px] text-[var(--text-primary)]">
            {seller.firstName} {seller.lastName}
          </p>
          <Pill variant="warning" size="sm">Pending</Pill>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] truncate">{seller.email}</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
          Applied {formatDate(seller.createdAt)}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <MagButton
          variant="ghost"
          size="sm"
          disabled={rejecting || approving}
          onClick={() => reject(seller.id)}
          className="text-[var(--danger)] border-[var(--danger-border)] hover:bg-[var(--danger-muted)]"
        >
          <XCircle className="h-3.5 w-3.5" />
          {rejecting ? 'Rejecting…' : 'Reject'}
        </MagButton>
        <MagButton
          variant="primary"
          size="sm"
          disabled={approving || rejecting}
          onClick={() => approve(seller.id)}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {approving ? 'Approving…' : 'Approve'}
        </MagButton>
      </div>
    </div>
  );
}

export default function PendingSellersPage() {
  const { data: sellers = [], isLoading } = usePendingSellers();

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
            Seller Applications
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isLoading ? '…' : `${sellers.length} application${sellers.length !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[var(--radius)]" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-[var(--success)]" />
          <p className="font-medium text-[var(--text-primary)]">All caught up!</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">No pending seller applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller, i) => (
            <Reveal key={seller.id} delay={i * 60}>
              <SellerCard seller={seller} />
            </Reveal>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
