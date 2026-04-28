'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { TrendingUp, Users, ShoppingCart, DollarSign, Globe, Package, BarChart3, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSellerTopProducts, useTrendingProducts } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { data: trendingProducts, isLoading } = useTrendingProducts(8);
  const spotlightSellerId = trendingProducts?.[0]?.sellerId;
  const { data: spotlightProducts, isLoading: loadingSpotlight } = useSellerTopProducts(spotlightSellerId, 5);

  const metrics = useMemo(() => {
    const totalRevenue = trendingProducts?.reduce((sum, item) => sum + item.revenue30d, 0) ?? 0;
    const totalViews = trendingProducts?.reduce((sum, item) => sum + item.viewsCount, 0) ?? 0;
    const totalPurchases = trendingProducts?.reduce((sum, item) => sum + item.purchaseCount, 0) ?? 0;
    const avgScore = trendingProducts && trendingProducts.length > 0
      ? trendingProducts.reduce((sum, item) => sum + item.score, 0) / trendingProducts.length
      : 0;

    return [
      { icon: DollarSign, label: 'Trend revenue (30d)', value: totalRevenue, prefix: '$', suffix: '', numeric: false },
      { icon: Users, label: 'Tracked products', value: trendingProducts?.length ?? 0, prefix: '', suffix: '', numeric: true },
      { icon: ShoppingCart, label: 'Purchases', value: totalPurchases, prefix: '', suffix: '', numeric: true },
      { icon: Package, label: 'Views', value: totalViews, prefix: '', suffix: '', numeric: true },
      { icon: TrendingUp, label: 'Avg. trend score', value: avgScore, prefix: '', suffix: '', numeric: false },
      { icon: Globe, label: 'Spotlight products', value: spotlightProducts?.length ?? 0, prefix: '', suffix: '', numeric: true },
    ];
  }, [trendingProducts, spotlightSellerId, spotlightProducts]);

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Platform Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Live metrics computed from the Postgres serving layer</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 60}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[var(--text-tertiary)] font-medium">{m.label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <m.icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-[-0.02em]">
                {m.prefix}{m.numeric ? <AnimCounter target={m.value as number} /> : (typeof m.value === 'number' ? formatPrice(m.value) : String(m.value))}{m.suffix}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <Reveal delay={400}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Top trending products</h2>
                <p className="text-[13px] text-[var(--text-secondary)]">/api/analytics/trending-products</p>
              </div>
              <BarChart3 className="h-5 w-5 text-[var(--accent-text)]" />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-[var(--radius-sm)] skeleton" />
                ))}
              </div>
            ) : trendingProducts && trendingProducts.length > 0 ? (
              <div className="space-y-3">
                {trendingProducts.map((item, index) => (
                  <Link
                    key={item.productId}
                    href={`/products/${item.productId}`}
                    className="block rounded-[var(--radius-sm)] border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">#{index + 1} {item.category}</p>
                        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate mt-1">{item.productName}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] text-[var(--text-tertiary)]">Score</p>
                        <p className="font-display font-extrabold text-[16px] text-[var(--text-primary)]">{item.score.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-[12px] text-[var(--text-secondary)]">
                      <span>Views: <strong className="text-[var(--text-primary)]">{item.viewsCount}</strong></span>
                      <span>Purchases: <strong className="text-[var(--text-primary)]">{item.purchaseCount}</strong></span>
                      <span>Revenue: <strong className="text-[var(--text-primary)]">{formatPrice(item.revenue30d)}</strong></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No trend scores yet. Run the batch pipeline to populate the serving tables.</p>
            )}
          </div>
        </Reveal>

        <Reveal delay={480}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">Seller spotlight</h2>
                <p className="text-[13px] text-[var(--text-secondary)]">/api/analytics/sellers/{spotlightSellerId}/products</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--accent-text)]" />
            </div>

            {loadingSpotlight ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-[var(--radius-sm)] skeleton" />)}
              </div>
            ) : spotlightProducts && spotlightProducts.length > 0 ? (
              <div className="space-y-3">
                {spotlightProducts.map((item) => (
                  <div key={item.productId} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{item.category}</p>
                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mt-1 line-clamp-2">{item.productName}</h3>
                    <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                      <span>Score <strong className="text-[var(--text-primary)]">{item.score.toFixed(2)}</strong></span>
                      <span>Purchases <strong className="text-[var(--text-primary)]">{item.purchaseCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No seller spotlight available yet.</p>
            )}
          </div>
        </Reveal>
      </div>
    </PageLayout>
  );
}
