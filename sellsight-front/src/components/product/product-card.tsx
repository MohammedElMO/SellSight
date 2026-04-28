'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Check, Heart, Eye, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useAddToCart } from '@/lib/hooks';
import { formatPrice, cn } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import type { ProductDto } from '@shared/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ProductDto;
  /** When `featured`, the card uses a taller image and shows a featured ribbon. */
  variant?: 'default' | 'featured';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const addToLocalCart = useCartStore((s) => s.addItem);
  const { isAuthenticated, role } = useAuthStore();
  const { mutate: addToDbCart } = useAddToCart();
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const canAddToCart = role !== 'SELLER' && role !== 'ADMIN';
  const inStock      = product.active && product.stockQuantity > 0;
  const lowStock     = inStock && product.stockQuantity <= 5;
  const isFeatured   = variant === 'featured';
  const ratingValue  = product.ratingAvg && product.ratingAvg > 0 ? product.ratingAvg : null;

  const flash = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    if (isAuthenticated && role === 'CUSTOMER') {
      addToDbCart(
        { productId: product.id, quantity: 1 },
        { onSuccess: () => { toast.success('Added to cart', { duration: 1500 }); flash(); } },
      );
    } else {
      addToLocalCart(product);
      toast.success('Added to cart', { duration: 1500 });
      flash();
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((f) => !f);
    toast.success(favorite ? 'Removed from favorites' : 'Added to favorites', { duration: 1200 });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-[var(--radius-lg)] h-full"
    >
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative h-full flex flex-col bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden transition-shadow duration-300 group-hover:shadow-[var(--shadow-lg)]"
      >
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden bg-[var(--surface)]',
            isFeatured ? 'aspect-[4/5]' : 'aspect-square',
          )}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Package className="h-10 w-10 text-[var(--text-tertiary)]" />
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
                {product.category.toLowerCase()}
              </span>
            </div>
          )}

          {/* Top-row badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
            <div className="flex flex-col items-start gap-1.5">
              <span className="pointer-events-auto inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border-subtle)]">
                {product.category}
              </span>
              {isFeatured && (
                <span className="pointer-events-auto inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-[var(--accent)] text-white text-[10.5px] font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {lowStock && (
                <span className="pointer-events-auto inline-flex items-center h-6 px-2.5 rounded-full bg-[var(--warning-bg)] text-[var(--warning)] text-[10.5px] font-bold uppercase tracking-wider border border-[var(--warning-border)]">
                  Only {product.stockQuantity} left
                </span>
              )}
            </div>

            <button
              onClick={toggleFavorite}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(
                'pointer-events-auto h-8 w-8 inline-flex items-center justify-center rounded-full bg-[var(--bg-card)]/90 backdrop-blur border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-all',
                favorite && 'text-[var(--danger)]',
              )}
            >
              <Heart className={cn('h-4 w-4 transition-all', favorite && 'fill-current scale-110')} />
            </button>
          </div>

          {/* Out-of-stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[11px] font-bold text-white uppercase tracking-widest px-3 py-1.5 rounded-full bg-black/70">
                Sold out
              </span>
            </div>
          )}

          {/* Hover quick actions */}
          {inStock && (
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              {canAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--text-primary)] text-white text-[12.5px] font-semibold shadow-lg hover:opacity-90 transition-opacity"
                  aria-label={`Add ${product.name} to cart`}
                >
                  {added ? (
                    <><Check className="h-3.5 w-3.5 text-[var(--success)]" /> Added</>
                  ) : (
                    <><ShoppingCart className="h-3.5 w-3.5" /> Add to cart</>
                  )}
                </button>
              )}
              <button
                onClick={(e) => e.stopPropagation()}
                aria-label="Quick view"
                className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg hover:bg-[var(--surface)] transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className={cn('p-4 flex flex-col gap-2 flex-1', isFeatured && 'sm:p-5')}>
          {product.brand && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              {product.brand}
            </p>
          )}
          <h3
            className={cn(
              'font-medium text-[var(--text-primary)] leading-snug line-clamp-2 flex-1',
              isFeatured ? 'text-[16px]' : 'text-[14px]',
            )}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            <div className="flex flex-col">
              <span
                className={cn(
                  'font-display font-extrabold text-[var(--text-primary)] tracking-[-0.02em]',
                  isFeatured ? 'text-[22px]' : 'text-[17px]',
                )}
              >
                {formatPrice(product.price)}
              </span>
            </div>
            {ratingValue != null ? (
              <div className="flex items-center gap-1">
                <Rating value={ratingValue} size="xs" />
                {product.ratingCount > 0 && (
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    ({product.ratingCount})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-[var(--text-tertiary)]">No reviews yet</span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
