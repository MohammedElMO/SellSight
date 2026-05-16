'use client';

import { useProfile, useSellerProductAnalytics, useSellerProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { MagButton } from '@/components/ui/mag-button';
import { AnimCounter } from '@/components/ui/anim-counter';
import { BarChart3, Package, Plus, ShoppingCart, Tag, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

function formatRate(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export default function SellerDashboardPage() {
  const { data: profile } = useProfile();
  const { data: productsPage, isLoading } = useSellerProducts(profile?.id, 0, 20);
  const { data: analytics, isLoading: loadingAnalytics } = useSellerProductAnalytics(7);

  const products      = productsPage?.products ?? [];
  const activeCount   = products.filter((p) => p.active).length;
  const totalValue    = products.reduce((s, p) => s + p.price, 0);
  const categoryCount = new Set(products.map((p) => p.category)).size;
  const productAnalytics = analytics?.products ?? [];

  const stats = [
    { label: 'Total products',  value: products.length,                                              icon: Package,    numeric: true  },
    { label: 'Active listings', value: activeCount,                                                  icon: Eye,        numeric: true  },
    { label: 'Categories',      value: categoryCount,                                                icon: Tag,        numeric: true  },
    { label: 'Avg. price',      value: products.length ? Math.round(totalValue / products.length) : 0, icon: TrendingUp, numeric: false, prefix: '$' },
  ];

  const engagementStats = [
    { label: 'Views 7d',       value: analytics?.totalViews ?? 0,       icon: Eye,          suffix: '' },
    { label: 'Carts 7d',       value: analytics?.totalAddToCarts ?? 0,  icon: ShoppingCart, suffix: '' },
    { label: 'Purchases 7d',   value: analytics?.totalPurchases ?? 0,   icon: Package,      suffix: '' },
    { label: 'View to cart',   value: analytics?.viewToCartRate ?? 0,   icon: BarChart3,    suffix: '%' },
  ];

  return (
    <PageLayout>
      <Reveal>
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

      <Reveal delay={220}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-[17px] text-[var(--text-primary)]">Product performance</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Views, carts, purchases, and conversion from the last 7 days</p>
          </div>
          <Link href="/seller/products" className="text-[13px] text-[var(--accent-text)] hover:opacity-80 transition-opacity">
            Manage products
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {engagementStats.map(({ label, value, icon: Icon, suffix }, i) => (
          <Reveal key={label} delay={240 + i * 40}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <Icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-[26px] text-[var(--text-primary)] tracking-[-0.02em]">
                {loadingAnalytics ? <Skeleton className="h-8 w-16" /> : suffix === '%' ? formatRate(value) : <AnimCounter target={value} />}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={320}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden mb-10">
          <div
            className="grid grid-cols-[minmax(0,2fr)_0.7fr_0.7fr_0.7fr_0.9fr_0.9fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
            style={{ background: 'var(--surface)' }}
          >
            <span>Product</span>
            <span className="text-right">Views</span>
            <span className="text-right">Carts</span>
            <span className="text-right">Buys</span>
            <span className="hidden md:block text-right">Cart rate</span>
            <span className="hidden lg:block text-right">Buy rate</span>
          </div>
          {loadingAnalytics ? (
            <div className="p-5 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-[var(--radius-xs)]" />
              ))}
            </div>
          ) : productAnalytics.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <BarChart3 className="h-9 w-9 mx-auto text-[var(--text-tertiary)] mb-3" />
              <p className="text-[14px] font-semibold text-[var(--text-secondary)]">No product activity yet</p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Customer views and cart actions will appear here as they happen.</p>
            </div>
          ) : (
            productAnalytics.slice(0, 8).map((item) => {
              const maxViews = Math.max(analytics?.totalViews ?? 0, 1);
              const viewShare = Math.min(100, Math.round((item.views / maxViews) * 100));
              return (
                <div
                  key={item.productId}
                  className="grid grid-cols-[minmax(0,2fr)_0.7fr_0.7fr_0.7fr_0.9fr_0.9fr] gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-9 w-9 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] overflow-hidden shrink-0"
                      style={{ background: 'var(--surface)' }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{item.productName}</p>
                      <div className="mt-1 h-1.5 w-full max-w-40 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${viewShare}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-right text-[13px] font-semibold text-[var(--text-primary)]">{item.views}</span>
                  <span className="text-right text-[13px] font-semibold text-[var(--text-primary)]">{item.addToCarts}</span>
                  <span className="text-right text-[13px] font-semibold text-[var(--text-primary)]">{item.purchases}</span>
                  <span className="hidden md:block text-right text-[13px] text-[var(--text-secondary)]">{formatRate(item.viewToCartRate)}</span>
                  <span className="hidden lg:block text-right text-[13px] text-[var(--text-secondary)]">{formatRate(item.viewToPurchaseRate)}</span>
                </div>
              );
            })
          )}
        </div>
      </Reveal>

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
