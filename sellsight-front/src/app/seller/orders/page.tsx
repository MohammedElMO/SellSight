'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { Pill } from '@/components/ui/pill';
import { useAllOrders, useUpdateOrderStatus } from '@/lib/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { OrderStatus } from '@shared/types';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function statusVariant(s: string): 'accent' | 'success' | 'danger' | 'secondary' | 'subtle' | 'warning' {
  if (s === 'DELIVERED') return 'success';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'SHIPPED')   return 'secondary';
  if (s === 'CONFIRMED' || s === 'PENDING') return 'accent';
  return 'subtle';
}

export default function SellerOrdersPage() {
  const [filter, setFilter] = useState<string>('ALL');
  const { data, isLoading } = useAllOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const orders = data ?? [];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Orders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage and track all customer orders</p>
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
              {f === 'ALL' ? `All (${orders.length})` : f.toLowerCase()}
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
          {filtered.map((order, i) => (
            <Reveal key={order.id} delay={i * 40}>
              <TiltCard intensity={2} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-4 flex items-center gap-5 cursor-pointer">
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
                <Link href={`/seller/orders/${order.id}`}>
                  <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
