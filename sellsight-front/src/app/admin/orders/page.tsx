'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { ClipboardList, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@shared/types';
import Link from 'next/link';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED',   'CANCELLED'],
  SHIPPED:   ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (role !== 'ADMIN') router.replace('/');
  }, [isAuthenticated, role, router]);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: orderApi.getAll,
    enabled: isAuthenticated && role === 'ADMIN',
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
    onError: () => toast.error('Failed to update order status'),
  });

  const filtered = statusFilter
    ? orders?.filter((o) => o.status === statusFilter)
    : orders;

  const statusCounts = orders?.reduce(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status as OrderStatus] || 0) + 1 }),
    {} as Record<OrderStatus, number>
  );

  return (
    <PageLayout>
      <div className="mb-7 animate-fade-in">
        <h1 className="text-[28px] font-bold text-[#111]">All orders</h1>
        <p className="text-sm text-[#666] mt-1">
          {orders?.length ?? '—'} total orders
        </p>
      </div>

      {/* Summary chips */}
      {statusCounts && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setStatusFilter('')}
            className={[
              'h-8 px-3.5 text-sm font-medium rounded-full border transition-all',
              statusFilter === ''
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999]',
            ].join(' ')}
          >
            All ({orders?.length ?? 0})
          </button>
          {(Object.entries(statusCounts) as [OrderStatus, number][]).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
              className={[
                'h-8 px-3.5 text-sm font-medium rounded-full border transition-all',
                statusFilter === status
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999]',
              ].join(' ')}
            >
              {status} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[10px]" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description={statusFilter ? 'No orders match this filter.' : 'Orders will appear here once customers start purchasing.'}
        />
      ) : (
        <div className="border border-[#e5e4e0] rounded-[14px] overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e4e0] bg-[#f7f6f2]">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => {
                  const transitions = TRANSITIONS[order.status];
                  return (
                    <tr key={order.id} className="border-b border-[#f7f6f2] last:border-0 hover:bg-[#fafaf9] transition-colors">
                      <td className="pl-5 pr-4 py-3.5">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs text-[#111] hover:underline"
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#666] font-mono">
                        {order.customerId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3.5 text-[#666]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#111]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#999]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        {transitions.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {transitions.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() =>
                                  updateStatus({ id: order.id, status: nextStatus })
                                }
                                disabled={isPending}
                                className={[
                                  'h-7 px-2.5 text-[11px] font-medium rounded-[6px] border transition-all disabled:opacity-40',
                                  nextStatus === 'CANCELLED'
                                    ? 'border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2]'
                                    : 'border-[#e5e4e0] text-[#111] hover:bg-[#f7f6f2]',
                                ].join(' ')}
                              >
                                → {nextStatus}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#999]">Final state</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
