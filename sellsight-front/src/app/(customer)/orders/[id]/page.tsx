'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/services';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-2xl flex flex-col gap-5">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-32 rounded-[14px]" />
          <Skeleton className="h-48 rounded-[14px]" />
        </div>
      </PageLayout>
    );
  }

  if (isError || !order) {
    return (
      <PageLayout>
        <EmptyState
          icon={Package}
          title="Order not found"
          action={
            <button
              onClick={() => router.push('/orders')}
              className="h-9 px-4 text-sm font-semibold bg-[#111] text-white rounded-[8px] hover:bg-[#333] transition-all"
            >
              Back to orders
            </button>
          }
        />
      </PageLayout>
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#999] mb-7">
        <Link href="/orders" className="hover:text-[#111] transition-colors">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#111] font-medium font-mono">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      <div className="max-w-2xl flex flex-col gap-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border border-[#e5e4e0] rounded-[14px]">
          <div>
            <p className="text-xs font-mono text-[#999] mb-1">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-[#666]">Placed on {formatDate(order.createdAt)}</p>
            {order.updatedAt && (
              <p className="text-sm text-[#999] text-xs mt-0.5">
                Updated {formatDate(order.updatedAt)}
              </p>
            )}
          </div>
          <OrderStatusBadge status={order.status} size="lg" />
        </div>

        {/* Order progress */}
        <div className="p-5 border border-[#e5e4e0] rounded-[14px]">
          <h2 className="text-sm font-semibold text-[#111] mb-4">Status</h2>
          <OrderProgress status={order.status} />
        </div>

        {/* Items */}
        <div className="p-5 border border-[#e5e4e0] rounded-[14px]">
          <h2 className="text-sm font-semibold text-[#111] mb-4">
            Items ({itemCount})
          </h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 py-3 border-t border-[#f7f6f2] first:border-t-0 first:pt-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-[8px] bg-[#f7f6f2] border border-[#e5e4e0] flex items-center justify-center shrink-0">
                    <Package className="h-4.5 w-4.5 text-[#bbb]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#999]">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#111] shrink-0">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="p-5 border border-[#e5e4e0] rounded-[14px]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Subtotal ({itemCount} items)</span>
              <span className="text-[#111]">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Shipping</span>
              <span className="text-[#16a34a] font-medium">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#111] pt-3 border-t border-[#f0efeb]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </button>
      </div>
    </PageLayout>
  );
}

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;
type Step = typeof ORDER_STEPS[number];

function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-sm text-[#dc2626]">
        <div className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
        This order was cancelled
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(status as Step);

  return (
    <div className="flex items-center gap-0">
      {ORDER_STEPS.map((step, i) => {
        const done   = i <= currentIndex;
        const active = i === currentIndex;
        const last   = i === ORDER_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done
                    ? 'bg-[#111] text-white'
                    : 'bg-[#f7f6f2] border border-[#e5e4e0] text-[#999]',
                  active && 'ring-4 ring-[#111]/10',
                ].join(' ')}
              >
                {done && !active ? '✓' : i + 1}
              </div>
              <span
                className={[
                  'text-[10px] font-medium whitespace-nowrap capitalize',
                  done ? 'text-[#111]' : 'text-[#999]',
                ].join(' ')}
              >
                {step.toLowerCase()}
              </span>
            </div>
            {!last && (
              <div
                className={[
                  'flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all',
                  i < currentIndex ? 'bg-[#111]' : 'bg-[#e5e4e0]',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
