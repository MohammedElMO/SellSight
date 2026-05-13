'use client';

import { useMemo } from 'react';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { orderApi, inventoryApi } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import {
  TrendingUp, Package, Users,
  ArrowRight, AlertTriangle, RefreshCw, Clock3,
  ShoppingCart, Truck, Warehouse,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { analyticsApi } from '@/lib/services';
import type { AnalyticsSummaryDto } from '@shared/types';

const ALERTS = [
  { type: 'warning', msg: '3 seller applications pending review',         link: '/admin/sellers/pending'  },
  { type: 'danger',  msg: '7 products flagged for moderation',            link: '/admin/products/flagged' },
  { type: 'warning', msg: '2 reviews reported as inappropriate',          link: '/admin/reviews/flagged'  },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function timeAgo(timestamp: number | undefined) {
  if (!timestamp) return 'just now';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours}h ago`;
}

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading: ordersLoading, dataUpdatedAt: ordersUpdatedAt } = useReactQuery({
    queryKey: ['admin-dashboard-orders'],
    queryFn: orderApi.getAll,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const { data: lowStockItems = [], dataUpdatedAt: lowStockUpdatedAt } = useReactQuery({
    queryKey: ['admin-dashboard-low-stock'],
    queryFn: inventoryApi.getLowStock,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const orders = useMemo(() => ordersData ?? [], [ordersData]);
  const recentOrders = useMemo(
    () => orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [orders],
  );

  const liveMetrics = useMemo(() => {
    const now = new Date();
    const todayOrders = orders.filter((order) => new Date(order.createdAt) >= startOfDay(now));
    const activeCustomers = new Set(
      orders
        .filter((order) => new Date(order.createdAt) >= new Date(now.getTime() - 60 * 60 * 1000))
        .map((order) => order.customerId),
    ).size;

    return {
      revenueToday: todayOrders.reduce((sum, order) => sum + order.total, 0),
      ordersToday: todayOrders.length,
      activeCustomers,
      lowStockCount: lowStockItems.length,
    };
  }, [lowStockItems.length, orders]);

  // Prefer analytics-derived active users when available
  const { data: analyticsSummary } = useReactQuery<AnalyticsSummaryDto>({
    queryKey: ['admin-analytics-summary-small'],
    queryFn: analyticsApi.getSummary,
    staleTime: 30_000,
  });

  const activeCustomersValue = analyticsSummary?.activeUsersLastHour ?? liveMetrics.activeCustomers;

  const extendedSales = useMemo(() => {
    const rows = analyticsSummary?.historicalDailySales ?? [];
    return {
      revenue: rows.reduce((sum, row) => sum + Number(row.revenue ?? 0), 0),
      orders: rows.reduce((sum, row) => sum + Number(row.orderCount ?? 0), 0),
    };
  }, [analyticsSummary]);

  const leadingProducts = useMemo(
    () => (analyticsSummary?.historicalTopProducts ?? []).slice(0, 3),
    [analyticsSummary],
  );

  const liveFeed = useMemo(() => {
    const orderEvents = recentOrders.slice(0, 3).map((order) => ({
      kind: 'order' as const,
      title: `Order ${order.id.slice(0, 8).toUpperCase()} ${order.status.toLowerCase()}`,
      detail: `${order.items.length} item${order.items.length !== 1 ? 's' : ''} • ${formatPrice(order.total)}`,
    }));

    const stockEvents = lowStockItems.slice(0, 2).map((stock) => ({
      kind: 'stock' as const,
      title: `Low stock: ${stock.productId.slice(0, 8).toUpperCase()}`,
      detail: `${stock.quantity} left, threshold ${stock.reorderThreshold}`,
    }));

    return [...orderEvents, ...stockEvents].slice(0, 5);
  }, [lowStockItems, recentOrders]);

  const stats = [
    {
      icon: TrendingUp,
      label: 'Revenue Today',
      val: liveMetrics.revenueToday,
      prefix: '',
      suffix: '',
      change: 'Auto-refreshed from today orders',
    },
    {
      icon: ShoppingCart,
      label: 'Orders Today',
      val: liveMetrics.ordersToday,
      prefix: '',
      suffix: '',
      change: 'Auto-refreshed every 15 seconds',
    },
    {
      icon: Users,
      label: 'Active Customers',
      val: activeCustomersValue,
      prefix: '',
      suffix: '',
      change: 'Unique customers in the last hour',
    },
    {
      icon: Warehouse,
      label: 'Low Stock SKUs',
      val: liveMetrics.lowStockCount,
      prefix: '',
      suffix: '',
      change: 'Driven by inventory events',
    },
  ];

  return (
    <PageLayout raw>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-10">
        <Reveal>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-[32px] text-[var(--text-primary)] tracking-[-0.03em]">Admin Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Live order and inventory monitoring</p>
            </div>
            <Link href="/admin/analytics">
              <MagButton variant="secondary" size="sm">
                Full analytics <ArrowRight className="h-3.5 w-3.5" />
              </MagButton>
            </Link>
          </div>
        </Reveal>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{s.label}</span>
                  <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                    <s.icon className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                </div>
                <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-[-0.02em]">
                  {s.label === 'Revenue Today' ? formatPrice(s.val) : <>{s.prefix}<AnimCounter target={s.val} />{s.suffix}</>}
                </div>
                <div className="text-[12px] font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--success)' }}>
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 mb-5">
          {/* Recent orders */}
          <Reveal delay={320}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Recent Orders</h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]">
                    <RefreshCw className="h-3 w-3" /> live
                  </span>
                  <Link href="/admin/orders" className="text-[12px] text-[var(--accent-text)] hover:underline font-medium">View all →</Link>
                </div>
              </div>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 skeleton rounded-[var(--radius-xs)]" />)}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr] gap-3 py-2 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    <span>Order</span><span>Total</span><span>Items</span><span>Status</span>
                  </div>
                  {recentOrders.map(o => (
                    <div key={o.id} className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr] gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] -mx-5 px-5 transition-colors cursor-pointer">
                      <span className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">#{o.id.toString().slice(-6)}</span>
                      <span className="font-display font-bold text-[13px] text-[var(--text-primary)]">{formatPrice(o.total)}</span>
                      <span className="text-[13px] text-[var(--text-secondary)]">{o.items.length}</span>
                      <Pill size="sm" variant={o.status === 'DELIVERED' ? 'success' : o.status === 'CANCELLED' ? 'danger' : 'accent'}>
                        {o.status.toLowerCase()}
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Live activity */}
          <Reveal delay={400}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Live activity feed</h2>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    Orders refreshed {timeAgo(ordersUpdatedAt)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  Stocks {timeAgo(lowStockUpdatedAt)}
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {liveFeed.map((item) => (
                  <div key={`${item.kind}-${item.title}`} className="flex items-start gap-3 p-3 rounded-[var(--radius-xs)] bg-[var(--surface)]/70 border border-[var(--border-subtle)]">
                    <div className="mt-0.5 h-8 w-8 rounded-full flex items-center justify-center" style={{ background: item.kind === 'order' ? 'var(--accent-muted)' : 'rgba(245,158,11,.15)' }}>
                      {item.kind === 'order' ? <Truck className="h-4 w-4 text-[var(--accent-text)]" /> : <Package className="h-4 w-4 text-[var(--warning)]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-display font-semibold text-[13px] text-[var(--text-primary)] mb-3">Alerts & Actions</h3>
              <div className="space-y-3">
                {ALERTS.map((a, i) => (
                  <Link key={i} href={a.link}
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors group"
                  >
                    {a.type === 'danger'  && <AlertTriangle className="h-4 w-4 text-[var(--danger)] mt-0.5 flex-none" />}
                    {a.type === 'warning' && <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-none" />}
                    <p className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-snug">
                      {a.msg}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 mb-5">
          <Reveal delay={440}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Sales Snapshot</h2>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Broader revenue and order movement</p>
                </div>
                <BarChart3 className="h-4 w-4 text-[var(--accent-text)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/60 p-4">
                  <div className="text-[12px] text-[var(--text-tertiary)]">Revenue</div>
                  <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1">
                    {formatPrice(extendedSales.revenue)}
                  </div>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/60 p-4">
                  <div className="text-[12px] text-[var(--text-tertiary)]">Orders</div>
                  <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1">
                    <AnimCounter target={extendedSales.orders} />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Leading Products</h2>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Additional product performance detail</p>
                </div>
                <Link href="/admin/analytics" className="text-[12px] text-[var(--accent-text)] hover:underline font-medium">Open analytics</Link>
              </div>
              {leadingProducts.length === 0 ? (
                <div className="text-[13px] text-[var(--text-secondary)]">No product performance available yet.</div>
              ) : (
                <div className="space-y-2">
                  {leadingProducts.map((product) => (
                    <div key={product.productId} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--radius-xs)] bg-[var(--surface)]/70 border border-[var(--border-subtle)] p-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{product.productName}</div>
                        <div className="text-[12px] text-[var(--text-tertiary)]">{product.unitsSold} sold</div>
                      </div>
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{formatPrice(product.revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

      </div>
    </PageLayout>
  );
}
