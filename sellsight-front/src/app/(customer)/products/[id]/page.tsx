'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  useProduct, useAddToCart,
  usePriceDropSubscription, useTogglePriceDropSubscription,
  useBackInStockSubscription, useToggleBackInStockSubscription,
} from '@/lib/hooks';
import { useTracker } from '@/hooks/useTracker';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { PageLayout } from '@/components/layout/page-layout';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { formatPrice, formatDate } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { TiltCard } from '@/components/ui/tilt-card';
import { Pill } from '@/components/ui/pill';
import {
  ShoppingCart, Package, Truck, ChevronRight, Minus, Plus, ArrowLeft, Check, Heart, Bell, BellOff,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ReviewSection } from '@/components/review/review-section';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { QASection } from '@/components/product/qa-section';
import { ProductCard } from '@/components/product/product-card';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { role, isAuthenticated } = useAuthStore();

  const isCustomer = role === 'CUSTOMER';
  const isLoggedInCustomer = isAuthenticated && isCustomer;
  const canAddToCart = role !== 'SELLER' && role !== 'ADMIN';

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'qa'>('details');

  const { track } = useTracker();
  const { addProduct } = useRecentlyViewed();
  const addToDbCart = useAddToCart();
  const { data: priceDropSub } = usePriceDropSubscription(id);
  const togglePriceDrop = useTogglePriceDropSubscription(id);
  const isSubscribedPriceDrop = priceDropSub?.subscribed ?? false;

  const { data: backInStockSub } = useBackInStockSubscription(id);
  const toggleBackInStock = useToggleBackInStockSubscription(id);
  const isSubscribedBackInStock = backInStockSub?.subscribed ?? false;

  const { data: product, isLoading, isError } = useProduct(id);

  useEffect(() => {
    if (!product) return;
    addProduct(product);
    const timer = setTimeout(() => {
      track('PRODUCT_VIEW', { productId: product.id, productName: product.name });
    }, 2000);
    return () => clearTimeout(timer);
  }, [product, track, addProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    if (isLoggedInCustomer) {
      addToDbCart.mutate(
        { productId: product.id, quantity },
        {
          onSuccess: () => {
            track('ADD_TO_CART', { productId: product.id, quantity, price: product.price });
            toast.success(`${product.name} added to cart`);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          },
        },
      );
    } else {
      addItem(product, quantity);
      track('ADD_TO_CART', { productId: product.id, quantity, price: product.price });
      toast.success(`${product.name} added to cart`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <PageLayout>
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may have been removed or the link is invalid."
          action={
            <MagButton onClick={() => router.push('/products')} variant="primary">
              Back to shop
            </MagButton>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <Reveal>
        <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] mb-7">
          <Link href="/products" className="hover:text-[var(--accent-text)] transition-colors">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-secondary)]">{product.category}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ── Left: image ── */}
        <Reveal delay={60}>
          <div className="flex flex-col gap-3 lg:sticky lg:top-24">
            <div
              className="aspect-square rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)]"
              style={{ background: 'var(--surface)' }}
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Package className="h-16 w-16 text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-tertiary)]">{product.category}</span>
                </div>
              )}
            </div>
            {/* thumbnail strip (single image for now) */}
            <div className="flex gap-2">
              <div
                className="h-20 w-20 rounded-[var(--radius-sm)] border-2 overflow-hidden shrink-0"
                style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Right: details ── */}
        <Reveal delay={120}>
          <div className="flex flex-col">
            <p className="text-[12px] text-[var(--text-tertiary)] font-medium mb-2 uppercase tracking-wider">
              Seller #{product.sellerId.slice(0, 8)}
            </p>

            <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] text-[var(--text-primary)] leading-tight mb-3 tracking-[-0.02em]">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <Rating value={product.ratingAvg ?? 0} size="sm" showValue count={product.ratingCount ?? 0} />
            </div>

            <div className="font-display font-extrabold text-[34px] tracking-[-0.02em] mb-2" style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {formatPrice(product.price)}
            </div>

            {(() => {
              const inStock = product.active && product.stockQuantity > 0;
              const lowStock = inStock && product.stockQuantity <= 5;
              return (
                <div className="flex items-center gap-2 mb-6">
                  <Pill size="sm" variant="accent">{product.category}</Pill>
                  {!product.active
                    ? <Pill size="sm" variant="danger">Unavailable</Pill>
                    : inStock
                      ? lowStock
                        ? <Pill size="sm" variant="warning">Low stock — {product.stockQuantity} left</Pill>
                        : <Pill size="sm" variant="success">In stock</Pill>
                      : <Pill size="sm" variant="danger">Out of stock</Pill>}
                </div>
              );
            })()}

            {/* Quantity + CTA */}
            {canAddToCart && (
              <>
                {product.active && product.stockQuantity > 0 ? (
                  <div className="flex flex-col gap-2 mb-5">
                    <span className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="h-10 w-14 flex items-center justify-center text-sm font-bold text-[var(--text-primary)] rounded-[var(--radius-xs)] border border-[var(--border)]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                        className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-3 mb-6">
                  <MagButton
                    onClick={handleAddToCart}
                    variant={added ? 'secondary' : 'primary'}
                    size="lg"
                    disabled={!product.active || product.stockQuantity === 0}
                    className="flex-1"
                  >
                    {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    {added
                      ? 'Added!'
                      : (!product.active || product.stockQuantity === 0)
                        ? 'Out of stock'
                        : 'Add to cart'}
                  </MagButton>
                  <WishlistButton productId={product.id} className="h-[52px] w-[52px]" />
                </div>
              </>
            )}

            {isLoggedInCustomer && (
              <div className="flex flex-col gap-1 mb-4">
                <button
                  onClick={() => togglePriceDrop.mutate({ subscribed: isSubscribedPriceDrop })}
                  disabled={togglePriceDrop.isPending}
                  className="flex items-center gap-2 text-[13px] font-medium transition-colors"
                  style={{ color: isSubscribedPriceDrop ? 'var(--accent-text)' : 'var(--text-secondary)' }}
                >
                  {isSubscribedPriceDrop ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  {isSubscribedPriceDrop ? 'Subscribed to price drops' : 'Notify me of price drops'}
                </button>

                {(!product.active || product.stockQuantity === 0) && (
                  <button
                    onClick={() => toggleBackInStock.mutate({ subscribed: isSubscribedBackInStock })}
                    disabled={toggleBackInStock.isPending}
                    className="flex items-center gap-2 text-[13px] font-medium transition-colors"
                    style={{ color: isSubscribedBackInStock ? 'var(--success)' : 'var(--text-secondary)' }}
                  >
                    {isSubscribedBackInStock ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    {isSubscribedBackInStock ? 'Watching for restock' : 'Notify me when back in stock'}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] py-4 border-t border-[var(--border-subtle)]">
              <Truck className="h-4 w-4 text-[var(--accent-text)] shrink-0" />
              Free delivery on orders over $30.00
            </div>

            <p className="text-[12px] text-[var(--text-tertiary)] mt-3">
              Listed {formatDate(product.createdAt)}
            </p>
          </div>
        </Reveal>
      </div>

      {/* ── Tabs ── */}
      <Reveal delay={200}>
        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
          <div className="flex gap-1 mb-8">
            {(['details', 'reviews', 'qa'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="h-9 px-5 rounded-full text-[13px] font-medium transition-all capitalize"
                style={activeTab === tab
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {tab === 'qa' ? 'Q&A' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="max-w-2xl">
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <ReviewSection
              productId={product.id}
              ratingAvg={product.ratingAvg ?? 0}
              ratingCount={product.ratingCount ?? 0}
            />
          )}
          {activeTab === 'qa' && (
            <QASection productId={product.id} />
          )}
        </div>
      </Reveal>

      <div className="mt-10 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent-text)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    </PageLayout>
  );
}

function ProductDetailSkeleton() {
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-36 mt-2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-[52px] w-full mt-4 rounded-[var(--radius)]" />
        </div>
      </div>
    </PageLayout>
  );
}
