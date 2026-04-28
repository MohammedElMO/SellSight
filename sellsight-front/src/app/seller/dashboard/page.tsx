'use client';

import { useProfile, useSellerAnalyticsSummary, useSellerProducts, useSellerTopProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { MagButton } from '@/components/ui/mag-button';
import { AnimCounter } from '@/components/ui/anim-counter';
import { formatPrice } from '@/lib/utils';
import { Package, Plus, TrendingUp, Eye, Tag, BarChart3, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { data: profile } = useProfile();
  const { data: productsPage, isLoading } = useSellerProducts(profile?.id, 0, 20);
  const { data: analyticsSummary } = useSellerAnalyticsSummary(profile?.id);
  const { data: topProducts, isLoading: loadingTopProducts } = useSellerTopProducts(profile?.id, 5);

  const products      = productsPage?.products ?? [];
  const activeCount   = products.filter((p) => p.active).length;
  const totalValue    = products.reduce((s, p) => s + p.price, 0);
  const categoryCount = new Set(products.map((p) => p.category)).size;

  const summaryCards = analyticsSummary ? [
    { label: 'Views', value: analyticsSummary.viewsCount, icon: Eye, numeric: true },
    { label: 'Clicks', value: analyticsSummary.clicksCount, icon: BarChart3, numeric: true },
    { label: 'Cart adds', value: analyticsSummary.addToCartCount, icon: ShoppingCart, numeric: true },
    { label: 'Purchases', value: analyticsSummary.purchaseCount, icon: Package, numeric: true },
  ] : [];

  const stats = [
    { label: 'Total products',  value: products.length,                                              icon: Package,    numeric: true  },
    { label: 'Active listings', value: activeCount,                                                  icon: Eye,        numeric: true  },
    { label: 'Categories',      value: categoryCount,                                                icon: Tag,        numeric: true  },
    { label: 'Avg. price',      value: products.length ? Math.round(totalValue / products.length) : 0, icon: TrendingUp, numeric: false, prefix: '$' },
  ];

  return (
    <PageLayout>
      <Reveal>

      {analyticsSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {summaryCards.map(({ label, value, icon: Icon, numeric }, i) => (
            <Reveal key={label} delay={i * 60}>
              <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
                  <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                    <Icon className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                </div>
                <div className="font-display font-extrabold text-[26px] text-[var(--text-primary)] tracking-[-0.02em]">
                  {numeric ? <AnimCounter target={value as number} /> : (value as number)}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {analyticsSummary && (
        <Reveal delay={240}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display font-semibold text-[17px] text-[var(--text-primary)]">Trend score summary</h2>
                <p className="text-[13px] text-[var(--text-secondary)]">Aggregated from the serving layer in PostgreSQL</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Score</p>
                <p className="font-display font-extrabold text-[24px] text-[var(--text-primary)]">{analyticsSummary.score.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px] text-[var(--text-secondary)]">
              <div><span className="block text-[var(--text-tertiary)]">Revenue 30d</span><strong className="text-[var(--text-primary)]">{formatPrice(analyticsSummary.revenue30d)}</strong></div>
              <div><span className="block text-[var(--text-tertiary)]">Views</span><strong className="text-[var(--text-primary)]">{analyticsSummary.viewsCount}</strong></div>
              <div><span className="block text-[var(--text-tertiary)]">Clicks</span><strong className="text-[var(--text-primary)]">{analyticsSummary.clicksCount}</strong></div>
              <div><span className="block text-[var(--text-tertiary)]">Updated</span><strong className="text-[var(--text-primary)]">{new Date(analyticsSummary.computedAt).toLocaleDateString()}</strong></div>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={280}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-[17px] text-[var(--text-primary)]">Top analytics products</h2>
          <span className="text-[13px] text-[var(--text-secondary)]">From /api/analytics/sellers/{profile?.id}/products</span>
        </div>
      </Reveal>

      {loadingTopProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 rounded-[var(--radius)] bg-[var(--bg-card)] skeleton" />)}
        </div>
      ) : topProducts && topProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {topProducts.map((item) => (
            <TiltCard key={item.productId} intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 border border-[var(--border)]">
              <p className="text-[12px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{item.category}</p>
              <h3 className="mt-2 text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">{item.productName}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-[var(--text-secondary)]">
                <div><span className="block text-[var(--text-tertiary)]">Score</span><strong className="text-[var(--text-primary)]">{item.score.toFixed(2)}</strong></div>
                <div><span className="block text-[var(--text-tertiary)]">Purchases</span><strong className="text-[var(--text-primary)]">{item.purchaseCount}</strong></div>
                <div><span className="block text-[var(--text-tertiary)]">Views</span><strong className="text-[var(--text-primary)]">{item.viewsCount}</strong></div>
                <div><span className="block text-[var(--text-tertiary)]">Clicks</span><strong className="text-[var(--text-primary)]">{item.clicksCount}</strong></div>
              </div>
            </TiltCard>
          ))}
        </div>
      ) : null}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Welcome back{profile ? `, ${profile.firstName}` : ''}
            </p>
          </div>
          <Link href="/seller/products/new">
            <MagButton variant="primary">
              <Plus className="h-4 w-4" />
              New product
            </MagButton>
          </Link>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, numeric, prefix }, i) => (
          <Reveal key={label} delay={i * 60}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <Icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-[26px] text-[var(--text-primary)] tracking-[-0.02em]">
                {prefix}{numeric ? <AnimCounter target={value as number} /> : (value as number)}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Recent products */}
      <Reveal delay={280}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-[17px] text-[var(--text-primary)]">Your products</h2>
          <Link href="/seller/products" className="text-[13px] text-[var(--accent-text)] hover:opacity-80 transition-opacity">
            View all →
          </Link>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Reveal delay={320}>
          <div
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[var(--radius-lg)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <Package className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
            <p className="text-[14px] font-semibold text-[var(--text-secondary)] mb-1">No products yet</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-5">Create your first listing to get started</p>
            <Link href="/seller/products/new">
              <MagButton variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Create product
              </MagButton>
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {products.slice(0, 8).map((product, i) => (
            <Reveal key={product.id} delay={320 + i * 40}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
