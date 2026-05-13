"use client";

import { useMemo, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, ArrowUpRight, ShieldAlert, Eye, MousePointerClick, BarChart3 } from 'lucide-react';
import { Pill } from '@/components/ui/pill';
import { analyticsApi, orderApi, inventoryApi } from '@/lib/services';
import type { AnalyticsSummaryDto, TopProductDto, StockDto } from '@shared/types';

function Money({ v }: { v: number }) {
  return <>{v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`}</>;
}

function Count({ v }: { v: number }) {
  return <>{Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>;
}

function Percent({ v }: { v: number }) {
  return <>{`${v.toFixed(v >= 10 ? 1 : 2)}%`}</>;
}

const REVENUE_DAY_LABELS = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yesterday', 'Today'];

const subscribeMounted = () => () => undefined;
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

function useClientMounted() {
  return useSyncExternalStore(subscribeMounted, getMountedSnapshot, getServerMountedSnapshot);
}

function AnalyticsShell() {
  return (
    <PageLayout>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Platform Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Comprehensive platform performance metrics</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 h-28 skeleton" />
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 mb-6">
        <div className="h-[300px] rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)] skeleton" />
        <div className="h-[300px] rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)] skeleton" />
      </div>
    </PageLayout>
  );
}

function RevenueSparkline({ values }: { values: number[] }) {
  const width = 560;
  const height = 180;
  const paddingX = 16;
  const paddingY = 18;
  const maxValue = Math.max(...values, 1);
  const stepX = values.length > 1 ? (width - paddingX * 2) / (values.length - 1) : 0;
  const points = values.map((value, index) => {
    const x = paddingX + index * stepX;
    const y = height - paddingY - ((value / maxValue) * (height - paddingY * 2));
    return `${x},${y}`;
  });

  const areaPath = [
    `M ${paddingX} ${height - paddingY}`,
    ...points.map((point) => `L ${point}`),
    `L ${width - paddingX} ${height - paddingY}`,
    'Z',
  ].join(' ');

  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px] overflow-visible">
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-text)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-text)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={paddingX}
            x2={width - paddingX}
            y1={height - paddingY - ratio * (height - paddingY * 2)}
            y2={height - paddingY - ratio * (height - paddingY * 2)}
            stroke="var(--border-subtle)"
            strokeDasharray="4 6"
          />
        ))}
        <path d={areaPath} fill="url(#revenueFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent-text)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => {
          const [x, y] = point.split(',').map(Number);
          return <circle key={index} cx={x} cy={y} r="4.5" fill="var(--bg-card)" stroke="var(--accent-text)" strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-7 gap-2 text-[11px] text-[var(--text-tertiary)]">
        {values.map((value, index) => (
          <div key={index} className="text-center">
            <div className="font-medium">{REVENUE_DAY_LABELS[index] ?? `D-${values.length - 1 - index}`}</div>
            <div>{value > 0 ? '$' + value.toFixed(0) : '$0'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderFunnelChart({ stages }: { stages: Array<{ label: string; value: number; tone: string }> }) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const widthPercent = `${Math.max(10, (stage.value / maxValue) * 100)}%`;
        return (
          <div key={stage.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-[12px]">
              <span className="font-medium text-[var(--text-primary)]">{stage.label}</span>
              <span className="text-[var(--text-tertiary)]">{stage.value}</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--surface)] overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: widthPercent, background: stage.tone }}
              />
            </div>
            {index < stages.length - 1 && (
              <div className="flex justify-center">
                <div className="w-px h-2 bg-[var(--border-subtle)]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopProductsBarChart({ items }: { items: TopProductDto[] }) {
  const max = Math.max(...items.map((i) => i.revenue), 1);
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const pct = Math.max(6, (it.revenue / max) * 100);
        return (
          <div key={it.productId} className="grid gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]">
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.productName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--text-tertiary)]">IMG</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">{it.productName}</div>
                <div className="text-[12px] text-[var(--text-tertiary)]">{it.productId} • {it.unitsSold} sold</div>
              </div>
              <div className="w-24 text-right text-[13px] text-[var(--text-secondary)]"><Money v={it.revenue} /></div>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#60a5fa)' }} />
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                {it.views} views / {it.addToCarts} carts / <Percent v={it.viewToPurchaseRate} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BehaviorFunnelChart({ stages }: { stages: Array<{ label: string; value: number; tone: string }> }) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <div key={stage.label} className="grid grid-cols-[86px_1fr_64px] items-center gap-3 text-[12px]">
          <div className="font-medium text-[var(--text-primary)]">{stage.label}</div>
          <div className="h-3 rounded-full bg-[var(--surface)] overflow-hidden border border-[var(--border-subtle)]">
            <div className="h-full rounded-full" style={{ width: `${Math.max(7, (stage.value / maxValue) * 100)}%`, background: stage.tone }} />
          </div>
          <div className="text-right text-[var(--text-tertiary)]"><Count v={stage.value} /></div>
        </div>
      ))}
    </div>
  );
}

function ExtendedSalesChart({ items }: { items: AnalyticsSummaryDto['historicalDailySales'] }) {
  const ordered = [...items].sort((a, b) => a.salesDay.localeCompare(b.salesDay));
  const values = ordered.map((item) => Number(item.revenue ?? 0));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {ordered.map((item) => {
          const pct = Math.max(4, (Number(item.revenue ?? 0) / maxValue) * 100);
          const label = new Date(item.salesDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          return (
            <div key={item.salesDay} className="grid grid-cols-[68px_1fr_88px] items-center gap-3 text-[12px]">
              <div className="font-medium text-[var(--text-primary)]">{label}</div>
              <div className="h-3 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0f766e,#60a5fa)' }} />
              </div>
              <div className="text-right text-[var(--text-tertiary)]"><Money v={Number(item.revenue ?? 0)} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevenueBars({
  items,
  getKey,
  getLabel,
  getRevenue,
  getMeta,
  color,
}: {
  items: unknown[];
  getKey: (item: unknown) => string;
  getLabel: (item: unknown) => string;
  getRevenue: (item: unknown) => number;
  getMeta: (item: unknown) => string;
  color: string;
}) {
  const max = Math.max(...items.map(getRevenue), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const revenue = getRevenue(item);
        const pct = Math.max(5, (revenue / max) * 100);
        return (
          <div key={getKey(item)} className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-[12px]">
              <div className="min-w-0">
                <div className="truncate font-medium text-[var(--text-primary)]">{getLabel(item)}</div>
                <div className="text-[11px] text-[var(--text-tertiary)]">{getMeta(item)}</div>
              </div>
              <div className="text-right font-semibold text-[var(--text-primary)]"><Money v={revenue} /></div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InventoryRiskList({ items }: { items: AnalyticsSummaryDto['inventoryRisk'] }) {
  return (
    <div className="max-h-[330px] overflow-y-auto pr-2">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="grid grid-cols-[1fr_auto] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{item.productName}</div>
              <div className="text-[12px] text-[var(--text-tertiary)]">
                Stock {item.stockQuantity} / threshold {item.reorderThreshold} / {item.unitsSold} sold
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-extrabold text-[var(--text-primary)]">{item.riskScore}</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">risk</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const mounted = useClientMounted();

  const { data, isLoading } = useQuery<AnalyticsSummaryDto>({
    queryKey: ['admin-analytics-summary'],
    queryFn: analyticsApi.getSummary,
    enabled: mounted,
    staleTime: 30_000,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-analytics-orders'],
    queryFn: orderApi.getAll,
    enabled: mounted,
    staleTime: 30_000,
  });

  const { data: lowStock = [], isLoading: lowStockLoading } = useQuery<StockDto[]>({
    queryKey: ['admin-low-stock'],
    queryFn: inventoryApi.getLowStock,
    enabled: mounted,
    staleTime: 60_000,
  });

  const metrics = useMemo(() => {
    if (!data) return [];
    return [
      { icon: DollarSign, label: 'Revenue Today', val: data.revenueToday, change: undefined },
      { icon: Users, label: 'Active Users (1h)', val: data.activeUsersLastHour, change: undefined },
      { icon: Users, label: 'Active Users (7d)', val: data.activeUsers7d, change: undefined },
      { icon: ArrowUpRight, label: 'New Users (7d)', val: data.newUsers7d, change: undefined },
      { icon: ShoppingCart, label: 'Orders (7d)', val: data.orders7d, change: undefined },
      { icon: Package, label: 'Orders (30d)', val: data.orders30d, change: undefined },
      { icon: ShieldAlert, label: 'Cancelled Orders (7d)', val: data.cancelledOrders7d, change: undefined },
      { icon: TrendingUp, label: 'Conversion (7d)', val: data.conversion7d * 100, change: '%' },
      { icon: DollarSign, label: 'Avg Order Value (7d)', val: data.averageOrderValue7d, change: undefined },
      { icon: DollarSign, label: 'Revenue (7d)', val: data.revenue7d, change: undefined },
      { icon: Eye, label: 'Product Views (7d)', val: data.productViews7d, change: undefined },
      { icon: MousePointerClick, label: 'Cart Rate (7d)', val: data.viewToCartRate7d * 100, change: '%' },
    ];
  }, [data]);

  const revenueTrend = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => 0);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      const dayIndex = Math.floor((startOfToday.getTime() - orderDay.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        buckets[6 - dayIndex] += Number(order.total ?? 0);
      }
    });

    return buckets;
  }, [orders]);

  const funnelStages = useMemo(() => {
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter((order) => order.status !== 'PENDING').length;
    const shippedOrders = orders.filter((order) => order.status === 'SHIPPED' || order.status === 'DELIVERED').length;
    const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED').length;

    return [
      { label: 'Placed', value: totalOrders, tone: 'linear-gradient(90deg, #4f46e5, #60a5fa)' },
      { label: 'Confirmed', value: confirmedOrders, tone: 'linear-gradient(90deg, #2563eb, #38bdf8)' },
      { label: 'Shipped', value: shippedOrders, tone: 'linear-gradient(90deg, #0f766e, #2dd4bf)' },
      { label: 'Delivered', value: deliveredOrders, tone: 'linear-gradient(90deg, #15803d, #4ade80)' },
      { label: 'Cancelled', value: cancelledOrders, tone: 'linear-gradient(90deg, #dc2626, #fb7185)' },
    ];
  }, [orders]);

  const behaviorStages = useMemo(() => [
    { label: 'Views', value: data?.productViews7d ?? 0, tone: 'linear-gradient(90deg, #4f46e5, #60a5fa)' },
    { label: 'Carts', value: data?.addToCart7d ?? 0, tone: 'linear-gradient(90deg, #0f766e, #2dd4bf)' },
    { label: 'Purchases', value: data?.purchases7d ?? 0, tone: 'linear-gradient(90deg, #15803d, #4ade80)' },
  ], [data]);

  const extendedBehaviorStages = useMemo(() => {
    const events = data?.historicalEventFunnel ?? [];
    const byType = new Map(events.map((event) => [event.eventType, event.eventCount]));
    return [
      { label: 'Views', value: byType.get('VIEW') ?? 0, tone: 'linear-gradient(90deg, #4f46e5, #60a5fa)' },
      { label: 'Carts', value: byType.get('ADD_TO_CART') ?? 0, tone: 'linear-gradient(90deg, #0f766e, #2dd4bf)' },
      { label: 'Purchases', value: byType.get('PURCHASE') ?? 0, tone: 'linear-gradient(90deg, #15803d, #4ade80)' },
    ];
  }, [data]);

  const extendedRevenueTotal = useMemo(
    () => (data?.historicalDailySales ?? []).reduce((sum, item) => sum + Number(item.revenue ?? 0), 0),
    [data],
  );

  const extendedOrderTotal = useMemo(
    () => (data?.historicalDailySales ?? []).reduce((sum, item) => sum + Number(item.orderCount ?? 0), 0),
    [data],
  );

  const historicalDailySales = data?.historicalDailySales ?? [];
  const historicalTopProducts = data?.historicalTopProducts ?? [];
  const categorySales = data?.categorySales ?? [];
  const sellerPerformance = data?.sellerPerformance ?? [];
  const inventoryRisk = data?.inventoryRisk ?? [];
  const monthlySales = data?.monthlySales ?? [];
  const customerValue = data?.customerValue ?? [];

  if (!mounted) {
    return <AnalyticsShell />;
  }

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Platform Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Comprehensive platform performance metrics</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 h-28 skeleton" />
            </Reveal>
          ))
        ) : (
          metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 60}>
              <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{m.label}</span>
                  <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                    <m.icon className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                </div>
                <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-[-0.02em]">
                  {m.change === '%'
                    ? <Percent v={Number(m.val ?? 0)} />
                    : m.label.includes('Revenue') || m.label.includes('Average Order Value')
                      ? <Money v={Number(m.val ?? 0)} />
                      : <Count v={Number(m.val ?? 0)} />}
                </div>
              </TiltCard>
            </Reveal>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 mb-6">
        <Reveal delay={360}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Revenue Trend</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Last 7 days based on live orders</p>
              </div>
              <Pill size="sm" variant="accent">Live orders</Pill>
            </div>
            {isLoading || ordersLoading ? (
              <div className="h-[220px] skeleton rounded-[var(--radius-sm)]" />
            ) : (
              <>
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <div className="text-[12px] text-[var(--text-tertiary)]">7-day revenue</div>
                    <div className="font-display font-extrabold text-3xl tracking-[-0.03em] text-[var(--text-primary)]">
                      <Money v={data?.revenue7d ?? revenueTrend.reduce((sum, value) => sum + value, 0)} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-[var(--text-tertiary)]">Orders</div>
                    <div className="font-display font-bold text-xl text-[var(--text-primary)]"><Count v={orders.length} /></div>
                  </div>
                </div>
                <RevenueSparkline values={revenueTrend} />
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={420}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Order Funnel</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Lifecycle from placed to delivered</p>
              </div>
              <Pill size="sm" variant="success">Live status mix</Pill>
            </div>
            {isLoading || ordersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-[var(--radius-sm)]" />)}
              </div>
            ) : (
              <OrderFunnelChart stages={funnelStages} />
            )}
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5 mb-6">
        <Reveal delay={450}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Customer Behavior</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Views, carts, and purchases from tracked events</p>
              </div>
              <Pill size="sm" variant="accent">Events</Pill>
            </div>
            {isLoading ? (
              <div className="h-[150px] skeleton rounded-[var(--radius-sm)]" />
            ) : (
              <BehaviorFunnelChart stages={behaviorStages} />
            )}
          </div>
        </Reveal>

        <Reveal delay={460}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="text-[12px] text-[var(--text-tertiary)] font-medium">View to cart</div>
              <div className="font-display font-extrabold text-3xl text-[var(--text-primary)] mt-2">
                <Percent v={(data?.viewToCartRate7d ?? 0) * 100} />
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-2">How many product views become cart additions.</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="text-[12px] text-[var(--text-tertiary)] font-medium">Cart to purchase</div>
              <div className="font-display font-extrabold text-3xl text-[var(--text-primary)] mt-2">
                <Percent v={(data?.cartToPurchaseRate7d ?? 0) * 100} />
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-2">How many cart signals end in purchase events.</p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <Reveal delay={480}>
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Top Products (7d)</h2>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Top performing items by revenue</p>
                </div>
                <Pill size="sm" variant="accent">7d</Pill>
              </div>
              {isLoading || !data ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton rounded-[var(--radius-xs)]" />)}
                </div>
              ) : data.topProducts.length === 0 ? (
                <div className="text-[13px] text-[var(--text-secondary)]">No product sales in the last 7 days.</div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto pr-2">
                  <TopProductsBarChart items={data.topProducts} />
                </div>
              )}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Low Stock</h2>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Products below reorder threshold</p>
                </div>
                <Pill size="sm" variant="warning">Inventory</Pill>
              </div>
              {lowStockLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-8 skeleton rounded-[var(--radius-xs)]" />)}
                </div>
              ) : lowStock.length === 0 ? (
                <div className="text-[13px] text-[var(--text-secondary)]">All stocks healthy</div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2">
                  {lowStock.slice(0, 8).map((s) => (
                    <div key={s.productId} className="flex items-center justify-between">
                      <div className="text-[13px] text-[var(--text-primary)] truncate max-w-[220px]">{s.productId}</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">Qty: {s.quantity}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 mt-6">
        <Reveal delay={520}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Sales History</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Extended order and revenue movement</p>
              </div>
              <Pill size="sm" variant="accent">Extended</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[230px] skeleton rounded-[var(--radius-sm)]" />
            ) : historicalDailySales.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">No sales history available yet.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/60 p-4">
                    <div className="text-[12px] text-[var(--text-tertiary)]">Revenue</div>
                    <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1"><Money v={extendedRevenueTotal} /></div>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/60 p-4">
                    <div className="text-[12px] text-[var(--text-tertiary)]">Orders</div>
                    <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1"><Count v={extendedOrderTotal} /></div>
                  </div>
                </div>
                <ExtendedSalesChart items={historicalDailySales} />
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={540}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Engagement Mix</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Tracked actions across the catalog</p>
              </div>
              <Pill size="sm" variant="success">Signals</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[150px] skeleton rounded-[var(--radius-sm)]" />
            ) : (
              <BehaviorFunnelChart stages={extendedBehaviorStages} />
            )}
          </div>
        </Reveal>
      </div>

      <Reveal delay={560}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 mt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Best Sellers</h2>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Additional product performance detail</p>
            </div>
            <BarChart3 className="h-4 w-4 text-[var(--accent-text)]" />
          </div>
          {isLoading || !data ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-[var(--radius-sm)]" />)}
            </div>
          ) : historicalTopProducts.length === 0 ? (
            <div className="text-[13px] text-[var(--text-secondary)]">No additional product performance available yet.</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {historicalTopProducts.map((product) => (
                <div key={product.productId} className="grid grid-cols-[1fr_auto] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{product.productName}</div>
                    <div className="text-[12px] text-[var(--text-tertiary)]">{product.unitsSold} sold</div>
                  </div>
                  <div className="text-right text-[13px] font-semibold text-[var(--text-primary)]"><Money v={product.revenue} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5 mt-6">
        <Reveal delay={580}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Category Sales</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Revenue and units sold by catalog category</p>
              </div>
              <Pill size="sm" variant="accent">Batch</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[240px] skeleton rounded-[var(--radius-sm)]" />
            ) : categorySales.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">No category sales available yet.</div>
            ) : (
              <RevenueBars
                items={categorySales}
                getKey={(item) => (item as AnalyticsSummaryDto['categorySales'][number]).category}
                getLabel={(item) => (item as AnalyticsSummaryDto['categorySales'][number]).category}
                getRevenue={(item) => Number((item as AnalyticsSummaryDto['categorySales'][number]).revenue ?? 0)}
                getMeta={(item) => {
                  const category = item as AnalyticsSummaryDto['categorySales'][number];
                  return `${category.unitsSold} units / ${category.orderCount} orders`;
                }}
                color="linear-gradient(90deg,#4f46e5,#06b6d4)"
              />
            )}
          </div>
        </Reveal>

        <Reveal delay={600}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Monthly Sales</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Longer-term revenue grouped by month</p>
              </div>
              <Pill size="sm" variant="success">History</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[240px] skeleton rounded-[var(--radius-sm)]" />
            ) : monthlySales.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">No monthly sales available yet.</div>
            ) : (
              <RevenueBars
                items={[...monthlySales].reverse()}
                getKey={(item) => (item as AnalyticsSummaryDto['monthlySales'][number]).salesMonth}
                getLabel={(item) => (item as AnalyticsSummaryDto['monthlySales'][number]).salesMonth}
                getRevenue={(item) => Number((item as AnalyticsSummaryDto['monthlySales'][number]).revenue ?? 0)}
                getMeta={(item) => `${(item as AnalyticsSummaryDto['monthlySales'][number]).orderCount} orders`}
                color="linear-gradient(90deg,#0f766e,#84cc16)"
              />
            )}
          </div>
        </Reveal>
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5 mt-6">
        <Reveal delay={620}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Seller Performance</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Revenue, orders, and catalog depth by seller</p>
              </div>
              <Pill size="sm" variant="accent">Sellers</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[230px] skeleton rounded-[var(--radius-sm)]" />
            ) : sellerPerformance.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">No seller performance available yet.</div>
            ) : (
              <div className="space-y-3">
                {sellerPerformance.map((seller) => (
                  <div key={seller.sellerId} className="grid grid-cols-[1fr_auto] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{seller.sellerName}</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">{seller.productCount} products / {seller.orderCount} orders / {seller.unitsSold} units</div>
                    </div>
                    <div className="text-right text-[13px] font-semibold text-[var(--text-primary)]"><Money v={seller.revenue} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={640}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Inventory Risk</h2>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Products ranked by stock pressure and demand signals</p>
              </div>
              <Pill size="sm" variant="warning">Risk</Pill>
            </div>
            {isLoading || !data ? (
              <div className="h-[230px] skeleton rounded-[var(--radius-sm)]" />
            ) : inventoryRisk.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">No inventory risk available yet.</div>
            ) : (
              <InventoryRiskList items={inventoryRisk} />
            )}
          </div>
        </Reveal>
      </div>

      <Reveal delay={660}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 mt-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Customer Value</h2>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Top customers by lifetime spend in the batch dataset</p>
            </div>
            <Pill size="sm" variant="success">Customers</Pill>
          </div>
          {isLoading || !data ? (
            <div className="grid md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-[var(--radius-sm)]" />)}
            </div>
          ) : customerValue.length === 0 ? (
            <div className="text-[13px] text-[var(--text-secondary)]">No customer value data available yet.</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {customerValue.map((customer) => (
                <div key={customer.customerId} className="grid grid-cols-[1fr_auto] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{customer.customerName}</div>
                    <div className="truncate text-[12px] text-[var(--text-tertiary)]">{customer.email ?? customer.customerId} / {customer.orderCount} orders</div>
                  </div>
                  <div className="text-right text-[13px] font-semibold text-[var(--text-primary)]"><Money v={customer.totalSpent} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>


    </PageLayout>
  );
}
