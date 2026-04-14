'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { OrderCard } from '@/components/order/order-card';
import { OrderCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
    enabled: isAuthenticated,
  });

  return (
    <PageLayout>
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-[#111]">My orders</h1>
        <p className="text-sm text-[#666] mt-1">Track and manage your purchases</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Link
              href="/products"
              className="h-10 px-5 flex items-center gap-2 text-sm font-semibold bg-[#111] text-white rounded-[9px] hover:bg-[#333] transition-all"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl animate-fade-in">
          {orders
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
        </div>
      )}
    </PageLayout>
  );
}
