'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminRefunds, useApproveRefund, useRejectRefund } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import type { RefundRequestDto } from '@shared/types';

function RefundRow({ refund }: { refund: RefundRequestDto }) {
  const { mutate: approve, isPending: approving } = useApproveRefund();
  const { mutate: reject,  isPending: rejecting  } = useRejectRefund();

  const statusVariant =
    refund.status === 'APPROVED' ? 'success' :
    refund.status === 'REJECTED' ? 'danger'  : 'warning';

  return (
    <div
      className="grid items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface)] transition-colors"
      style={{ gridTemplateColumns: '1fr 1fr 2fr 0.8fr 0.8fr 120px' }}
    >
      <span className="font-mono text-[12px] text-[var(--text-secondary)] truncate">{refund.orderId.slice(0, 8)}</span>
      <span className="text-[12px] text-[var(--text-secondary)] truncate">{refund.customerId.slice(0, 8)}</span>
      <span className="text-[13px] text-[var(--text-primary)] line-clamp-2">{refund.reason}</span>
      <span className="text-[12px] text-[var(--text-tertiary)]">{formatDate(refund.createdAt)}</span>
      <Pill size="sm" variant={statusVariant}>{refund.status}</Pill>

      {refund.status === 'PENDING' ? (
        <div className="flex gap-2">
          <MagButton size="sm" variant="primary" disabled={approving} onClick={() => approve(refund.id)}>
            <CheckCircle className="h-3.5 w-3.5" />
          </MagButton>
          <MagButton size="sm" variant="ghost" disabled={rejecting} onClick={() => reject(refund.id)} className="text-[var(--danger)]">
            <XCircle className="h-3.5 w-3.5" />
          </MagButton>
        </div>
      ) : (
        <span className="text-[12px] text-[var(--text-tertiary)]">
          {refund.resolvedAt ? formatDate(refund.resolvedAt) : '—'}
        </span>
      )}
    </div>
  );
}

export default function AdminRefundsPage() {
  const { data: refunds = [], isLoading, refetch } = useAdminRefunds();

  const pending  = refunds.filter((r) => r.status === 'PENDING').length;

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Refund Requests
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {isLoading ? '…' : `${pending} pending · ${refunds.length} total`}
            </p>
          </div>
          <MagButton variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </MagButton>
        </div>
      </Reveal>

      <Reveal delay={60}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ background: 'var(--surface)', gridTemplateColumns: '1fr 1fr 2fr 0.8fr 0.8fr 120px' }}
            >
              <span>Order</span>
              <span>Customer</span>
              <span>Reason</span>
              <span>Requested</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {refunds.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)] font-medium">No refund requests</p>
              </div>
            ) : (
              refunds.map((r) => <RefundRow key={r.id} refund={r} />)
            )}
          </div>
        )}
      </Reveal>
    </PageLayout>
  );
}
