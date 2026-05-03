'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { Pill } from '@/components/ui/pill';
import { useSellerOrders } from '@/lib/hooks';
import { orderApi } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { OrderDto, OrderStatus } from '@shared/types';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const NEXT_STATUS: Record<string, string | undefined> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

function statusVariant(s: string): 'accent' | 'success' | 'danger' | 'secondary' | 'subtle' | 'warning' {
  if (s === 'DELIVERED') return 'success';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'SHIPPED')   return 'secondary';
  if (s === 'CONFIRMED' || s === 'PENDING') return 'accent';
  return 'subtle';
}

type OptimisticAction = { orderId: string; newStatus: string };

export default function SellerOrdersPage() {
  const [filter, setFilter] = useState<string>('ALL');
  const { data, isLoading } = useSellerOrders();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const serverOrders = data ?? [];

  // Optimistic state: immediately show the new status, rollback on failure
  const [optimisticOrders, setOptimisticOrders] = useOptimistic(
    serverOrders,
    (currentOrders: OrderDto[], action: OptimisticAction) =>
      currentOrders.map((o) =>
        o.id === action.orderId ? { ...o, status: action.newStatus as OrderStatus } : o
      )
  );

  const handleAdvanceStatus = (orderId: string, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    startTransition(async () => {
      // Apply optimistic update immediately
      setOptimisticOrders({ orderId, newStatus: nextStatus });

      try {
        await orderApi.updateStatus(orderId, nextStatus);
        toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      } catch {
        // Rollback happens automatically — server data replaces optimistic
        toast.error('Failed to update order status');
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      }
    });
  };

  const filtered = filter === 'ALL' ? optimisticOrders : optimisticOrders.filter(o => o.status === filter);

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Orders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage orders containing your products</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-8 px-4 rounded-full text-[12px] font-medium transition-all"
              style={
                filter === f
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {f === 'ALL' ? `All (${optimisticOrders.length})` : f.toLowerCase()}
            </button>
          ))}
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-[var(--radius)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <Package className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="font-medium">No orders found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order, i) => {
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <Reveal key={order.id} delay={i * 40}>
                <TiltCard intensity={2} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-4 flex items-center gap-5">
                  <div className="flex-none">
                    <p className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">#{order.id.toString().slice(-6)}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                      {order.items.slice(0, 2).map(i => i.productName).join(', ')}
                      {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                    </p>
                  </div>
                  <div className="font-display font-extrabold text-base text-[var(--text-primary)]">
                    {formatPrice(order.total)}
                  </div>
                  <Pill variant={statusVariant(order.status)} size="sm">{order.status.toLowerCase()}</Pill>
                  {nextStatus && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleAdvanceStatus(order.id, order.status); }}
                      disabled={isPending}
                      className="h-7 px-3 text-[11px] font-medium rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all disabled:opacity-40"
                    >
                      → {nextStatus.toLowerCase()}
                    </button>
                  )}
                  <Link href={`/seller/orders/${order.id}`}>
                    <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
