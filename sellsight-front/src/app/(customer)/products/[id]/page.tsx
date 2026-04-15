'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatPrice, formatDate } from '@/lib/utils';
import { Rating, RatingBreakdown } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Heart,
  Package,
  Truck,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

/* ── Mock review data (reviews aren't in the backend) ───── */
const MOCK_RATING = 4.2;
const MOCK_REVIEW_COUNT = 42;
const MOCK_DISTRIBUTION = { 5: 25, 4: 9, 3: 4, 2: 2, 1: 2 } as const;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const role    = useAuthStore((s) => s.role);

  const canAddToCart = role !== 'SELLER' && role !== 'ADMIN';

  const [quantity,  setQuantity]  = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const { data: product, isLoading, isError } = useProduct(id);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
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
            <Button onClick={() => router.push('/products')} size="md">
              Back to shop
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#999] mb-7 animate-fade-in">
        <Link href="/products" className="hover:text-[#111] transition-colors">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-[#111] transition-colors cursor-pointer">
          {product.category}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#111] font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 animate-fade-in">
        {/* ── Left: images ── */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square rounded-[16px] bg-[#f7f6f2] overflow-hidden border border-[#e5e4e0]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Package className="h-16 w-16 text-[#ccc]" />
                <span className="text-sm text-[#bbb]">{product.category}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {[product.imageUrl].map((url, i) => (
              <div
                key={i}
                className="h-20 w-20 rounded-[10px] bg-[#f7f6f2] border-2 border-[#111] overflow-hidden shrink-0"
              >
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-[#ccc]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="flex flex-col">
          <p className="text-sm text-[#999] mb-1.5">Seller #{product.sellerId.slice(0, 8)}</p>

          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#111] leading-tight mb-3">
            {product.name}
          </h1>

          <Rating
            value={MOCK_RATING}
            size="sm"
            showValue
            count={MOCK_REVIEW_COUNT}
            className="mb-4"
          />

          <p className="text-3xl font-bold text-[#111] mb-5">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2 mb-6">
            <Badge variant="default">{product.category}</Badge>
            {product.active ? (
              <Badge variant="success">In stock</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>

          {/* Quantity + Add to cart — customers only */}
          {canAddToCart && (
            <>
              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[13px] font-medium text-[#111]">Quantity</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center rounded-[8px] border border-[#e5e4e0] text-[#666] hover:border-[#111] hover:text-[#111] transition-all"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-10 w-14 flex items-center justify-center text-sm font-semibold text-[#111] border border-[#e5e4e0] rounded-[8px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-10 w-10 flex items-center justify-center rounded-[8px] border border-[#e5e4e0] text-[#666] hover:border-[#111] hover:text-[#111] transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-5">
                <Button
                  onClick={handleAddToCart}
                  fullWidth
                  size="lg"
                  disabled={!product.active}
                  className="h-[52px] text-[15px]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart
                </Button>
                <button className="h-[52px] w-[52px] shrink-0 flex items-center justify-center border border-[#e5e4e0] rounded-[10px] text-[#666] hover:border-[#111] hover:text-[#111] transition-all">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 text-sm text-[#666] py-4 border-t border-[#f0efeb]">
            <Truck className="h-4 w-4 text-[#111] shrink-0" />
            Free delivery on orders over $30.00
          </div>

          <p className="text-xs text-[#999] mt-2">
            Listed {formatDate(product.createdAt)}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-14 border-t border-[#e5e4e0]">
        <div className="flex items-center gap-0 -mt-px">
          {(['details', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'h-11 px-5 text-sm font-medium capitalize border-b-2 transition-all',
                activeTab === tab
                  ? 'border-[#111] text-[#111]'
                  : 'border-transparent text-[#666] hover:text-[#111]',
              ].join(' ')}
            >
              {tab === 'reviews' ? `Reviews (${MOCK_REVIEW_COUNT})` : 'Details'}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'details' ? (
            <div className="max-w-2xl">
              <p className="text-[15px] text-[#444] leading-relaxed">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 max-w-3xl">
              <div className="flex flex-col items-center justify-center shrink-0 gap-2 p-8 border border-[#e5e4e0] rounded-[14px] w-full lg:w-44">
                <span className="text-5xl font-bold text-[#111]">{MOCK_RATING.toFixed(1)}</span>
                <Rating value={MOCK_RATING} size="sm" />
                <span className="text-sm text-[#666]">{MOCK_REVIEW_COUNT} reviews</span>
              </div>
              <div className="flex-1">
                <RatingBreakdown
                  distribution={MOCK_DISTRIBUTION}
                  total={MOCK_REVIEW_COUNT}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors"
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
        <Skeleton className="aspect-square rounded-[16px]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-36 mt-2" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-[52px] w-full mt-4 rounded-[10px]" />
        </div>
      </div>
    </PageLayout>
  );
}
