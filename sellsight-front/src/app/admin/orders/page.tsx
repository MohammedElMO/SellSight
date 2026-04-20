'use client';

import { useAllOrders, useUpdateOrderStatus } from '@/lib/hooks';
import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';
import type { OrderStatus } from '@shared/types';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED',   'CANCELLED'],
  SHIPPED:   ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data: orders, isLoading } = useAllOrders();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const filtered = statusFilter ? orders?.filter((o) => o.status === statusFilter) : orders;

  const statusCounts = orders?.reduce(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status as OrderStatus] || 0) + 1 }),
    {} as Record<OrderStatus, number>
  );

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">All orders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{orders?.length ?? '—'} total orders</p>
        </div>
      </Reveal>

      {/* Filter chips */}
      {statusCounts && (
        <Reveal delay={60}>
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <button
              onClick={() => setStatusFilter('')}
              className="h-8 px-4 rounded-full text-[12px] font-medium transition-all"
              style={statusFilter === ''
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              All ({orders?.length ?? 0})
            </button>
            {(Object.entries(statusCounts) as [OrderStatus, number][]).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
                className="h-8 px-4 rounded-full text-[12px] font-medium transition-all"
                style={statusFilter === status
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />)}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description={statusFilter ? 'No orders match this filter.' : 'Orders will appear here once customers start purchasing.'}
        />
      ) : (
        <Reveal delay={100}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            <div
              className="grid grid-cols-[1fr_1fr_0.5fr_0.8fr_1fr_0.8fr_1.2fr] gap-2 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ background: 'var(--surface)' }}
            >
              <span>Order ID</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Date</span>
              <span>Action</span>
            </div>
            {filtered
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((order) => {
                const transitions = TRANSITIONS[order.status];
                return (
                  <div
                    key={order.id}
                    className="grid grid-cols-[1fr_1fr_0.5fr_0.8fr_1fr_0.8fr_1.2fr] gap-2 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                  >
                    <span className="font-mono text-[12px] font-bold text-[var(--text-primary)]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="font-mono text-[12px] text-[var(--text-tertiary)]">
                      {order.customerId.slice(0, 8)}…
                    </span>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {formatPrice(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-[12px] text-[var(--text-tertiary)]">{formatDate(order.createdAt)}</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {transitions.length > 0 ? transitions.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() => updateStatus({ id: order.id, status: nextStatus })}
                          disabled={isPending}
                          className="h-7 px-2.5 text-[11px] font-medium rounded-[var(--radius-xs)] border transition-all disabled:opacity-40"
                          style={nextStatus === 'CANCELLED'
                            ? { borderColor: 'var(--danger-muted)', color: 'var(--danger)', background: 'transparent' }
                            : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
                        >
                          → {nextStatus}
                        </button>
                      )) : (
                        <span className="text-[11px] text-[var(--text-tertiary)]">Final state</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Reveal>
      )}
    </PageLayout>
  );
}
