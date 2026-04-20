'use client';

import { useMyOrders } from '@/lib/hooks';
import { OrderCard } from '@/components/order/order-card';
import { OrderCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { ClipboardList, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div className="w-full">
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">My orders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track and manage your purchases</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex flex-col gap-3 max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Link href="/products">
              <MagButton variant="primary">
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </MagButton>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {orders
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order, i) => (
              <Reveal key={order.id} delay={i * 50}>
                <OrderCard order={order} />
              </Reveal>
            ))}
        </div>
      )}
    </div>
  );
}
