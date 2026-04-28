'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { useProfile, useTrendingProducts, useUserRecommendations } from '@/lib/hooks';
import { productApi } from '@/lib/services';
import { useCart } from '@/lib/hooks';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProductRail } from '@/components/product/product-rail';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { ArrowRight, Package, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ProductDto } from '@shared/types';

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: '/products',
  SELLER:   '/seller/dashboard',
  ADMIN:    '/admin/dashboard',
};

function InstaTile({ product }: { product: ProductDto }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="relative aspect-square overflow-hidden bg-[var(--surface)] group"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-8 w-8 text-[var(--text-tertiary)]" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 px-3 text-center">
        <p className="font-semibold text-[13px] line-clamp-2">{product.name}</p>
        <p className="mt-1 text-[12px] font-bold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

function InstaGrid({ products, isLoading }: { products?: ProductDto[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[var(--surface)] skeleton" />
        ))}
      </div>
    );
  }
  if (!products?.length) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
      {products.map((p) => (
        <InstaTile key={p.id} product={p} />
      ))}
    </div>
  );
}

function TrendScoreTile({ item }: { item: { productId: string; productName: string; category: string; score: number; viewsCount: number; clicksCount: number; purchaseCount: number } }) {
  return (
    <Link
      href={`/products/${item.productId}`}
      className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{item.category}</p>
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] line-clamp-2 mt-1">{item.productName}</h3>
        </div>
        <div className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold bg-[var(--accent-muted)] text-[var(--accent-text)]">
          {item.score.toFixed(2)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px] text-[var(--text-secondary)]">
        <div>
          <span className="block text-[var(--text-tertiary)]">Views</span>
          <strong className="text-[var(--text-primary)]">{item.viewsCount}</strong>
        </div>
        <div>
          <span className="block text-[var(--text-tertiary)]">Clicks</span>
          <strong className="text-[var(--text-primary)]">{item.clicksCount}</strong>
        </div>
        <div>
          <span className="block text-[var(--text-tertiary)]">Purchases</span>
          <strong className="text-[var(--text-primary)]">{item.purchaseCount}</strong>
        </div>
      </div>
    </Link>
  );
}

function RecommendationTile({ item }: { item: { productId: string; productName: string; category: string; reason: string; score: number } }) {
  return (
    <Link
      href={`/products/${item.productId}`}
      className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{item.category}</p>
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] line-clamp-2 mt-1">{item.productName}</h3>
        </div>
        <Sparkles className="h-4 w-4 text-[var(--accent-text)]" />
      </div>
      <p className="text-[12px] text-[var(--text-secondary)] mb-2">{item.reason}</p>
      <p className="text-[12px] font-semibold text-[var(--text-primary)]">Recommendation score: {item.score.toFixed(2)}</p>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated, role, firstName } = useAuthStore();
  const { data: profile } = useProfile();
  const dashboardHref = role ? ROLE_HOME[role] || '/products' : '/';
  const { products: recentlyViewed } = useRecentlyViewed();
  const { data: cart } = useCart();
  const cartItems = cart?.items ?? [];

  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ['products', 'popular-grid'],
    queryFn:  () => productApi.getAll(0, 30),
    staleTime: 5 * 60 * 1000,
  });
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn:  () => productApi.getAll(0, 8, { sort: 'createdAt,desc' }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: bestSellingProducts, isLoading: loadingBestSelling } = useQuery({
    queryKey: ['products', 'best-selling'],
    queryFn:  () => productApi.getAll(0, 8, { sort: 'best_selling' }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: trendingScores } = useTrendingProducts(8);
  const { data: recommendations, isLoading: loadingRecommendations } = useUserRecommendations(profile?.id, 8);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Navbar />

      {/* ── Compact hero strip ── */}
      <section
        className="px-5 sm:px-10 py-10 border-b border-[var(--border-subtle)]"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <Reveal>
            <div>
              <h1 className="font-display font-extrabold text-3xl sm:text-[40px] text-[var(--text-primary)] leading-[1.1] tracking-[-0.03em]">
                {isAuthenticated
                  ? <>Welcome back, <span className="gradient-text">{firstName}</span></>
                  : <>Discover on <span className="gradient-text">SellSight</span></>}
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mt-2">
                Browse what sellers are listing right now.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex gap-3">
              <Link href="/products">
                <MagButton variant="primary" size="md">
                  Browse all <ArrowRight className="h-4 w-4" />
                </MagButton>
              </Link>
              {isAuthenticated && role && (
                <Link href={dashboardHref}>
                  <MagButton variant="secondary" size="md">Dashboard</MagButton>
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Instagram-style product grid ── */}
      <section className="max-w-[1200px] mx-auto w-full px-2 sm:px-4 py-6">
        <InstaGrid products={popular?.products} isLoading={loadingPopular} />
      </section>

      {/* ── New arrivals rail ── */}
      {newArrivals?.products && newArrivals.products.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <ProductRail
            title="New Arrivals"
            description="Fresh items just added by our sellers"
            products={newArrivals.products}
            isLoading={loadingNew}
          />
        </div>
      )}

      {/* ── Trend score rail ── */}
      {trendingScores && trendingScores.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <Reveal>
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-[var(--accent-text)]" />
              <div>
                <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.01em]">Trending Score</h2>
                <p className="text-[13px] text-[var(--text-secondary)]">Computed from views, clicks, cart events, and purchases</p>
              </div>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingScores.map((item, i) => (
              <Reveal key={item.productId} delay={i * 60}>
                <TrendScoreTile item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* ── Best selling rail ── */}
      {bestSellingProducts?.products && bestSellingProducts.products.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <ProductRail
            title="Best Selling"
            description="Best sellers based on product sales"
            products={bestSellingProducts.products}
            isLoading={loadingBestSelling}
          />
        </div>
      )}

      {/* ── Recommendations rail ── */}
      {isAuthenticated && role === 'CUSTOMER' && recommendations && recommendations.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <Reveal>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-5 w-5 text-[var(--accent-text)]" />
              <div>
                <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.01em]">Recommended for you</h2>
                <p className="text-[13px] text-[var(--text-secondary)]">Ranked by your behavior and product scores</p>
              </div>
            </div>
          </Reveal>
          {loadingRecommendations ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((item, i) => (
                <Reveal key={item.productId} delay={i * 60}>
                  <RecommendationTile item={item} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Continue Shopping rail (cart items) ── */}
      {isAuthenticated && role === 'CUSTOMER' && cartItems.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <Reveal>
            <div className="rounded-[var(--radius)] border border-[var(--border)] p-5" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.01em]">Continue Shopping</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Items waiting in your cart</p>
                </div>
                <Link href="/cart" className="text-[12px] font-semibold text-[var(--accent-text)] hover:underline">
                  View cart →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cartItems.map((item) => (
                  <Link key={item.productId} href={`/products/${item.productId}`} className="shrink-0 group">
                    <div className="w-32 flex flex-col gap-1.5">
                      <div className="aspect-square rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-center">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-[var(--text-tertiary)]" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate group-hover:text-[var(--accent-text)] transition-colors">{item.productName}</p>
                      <p className="text-[11px] font-bold text-[var(--text-primary)]">{formatPrice(item.unitPrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ── Recently Viewed rail ── */}
      {recentlyViewed.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-10">
          <ProductRail
            title="Recently Viewed"
            description="Products you've checked out"
            products={recentlyViewed}
            isLoading={false}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
