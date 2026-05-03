'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/services';
import { useCart } from '@/lib/hooks';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProductRail } from '@/components/product/product-rail';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { ArrowRight, Package } from 'lucide-react';
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

export default function HomePage() {
  const { isAuthenticated, role, firstName } = useAuthStore();
  const dashboardHref = role ? ROLE_HOME[role] || '/products' : '/';
  const { products: recentlyViewed } = useRecentlyViewed();
  const { data: cart } = useCart();
  const cartItems = cart?.items ?? [];

  const { data: landing, isLoading: loadingLanding } = useQuery({
    queryKey: ['products', 'landing'],
    queryFn:  () => productApi.getLanding(),
    staleTime: 2 * 60 * 1000,
  });
  const popular         = landing?.popular;
  const newArrivals     = landing?.newArrivals;
  const trendingProducts = landing?.trending;
  const loadingPopular  = loadingLanding;
  const loadingNew      = loadingLanding;
  const loadingTrending = loadingLanding;

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
        <InstaGrid products={popular} isLoading={loadingPopular} />
      </section>

      {/* ── New arrivals rail ── */}
      {newArrivals && newArrivals.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <ProductRail
            title="New Arrivals"
            description="Fresh items just added by our sellers"
            products={newArrivals}
            isLoading={loadingNew}
          />
        </div>
      )}

      {/* ── Trending rail ── */}
      {trendingProducts && trendingProducts.length > 0 && (
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-10 pb-8">
          <ProductRail
            title="Trending Now"
            description="Top-selling products this week"
            products={trendingProducts}
            isLoading={loadingTrending}
          />
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
