'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useAddToCart } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import { Pill } from '@/components/ui/pill';
import { TiltCard } from '@/components/ui/tilt-card';
import type { ProductDto } from '@shared/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ProductDto;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToLocalCart = useCartStore((s) => s.addItem);
  const { isAuthenticated, role } = useAuthStore();
  const { mutate: addToDbCart } = useAddToCart();
  const [added, setAdded] = useState(false);

  const canAddToCart = role !== 'SELLER' && role !== 'ADMIN';
  const inStock = product.active && product.stockQuantity > 0;

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

  return (
    <Link href={`/products/${product.id}`} className="group block rounded-[var(--radius)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
      <TiltCard
        intensity={6}
        className="bg-[var(--bg-card)] rounded-[var(--radius)] overflow-hidden h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-[var(--surface)] aspect-square">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Package className="h-10 w-10 text-[var(--text-tertiary)]" />
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{product.category.toLowerCase()}</span>
            </div>
          )}

            {/* Out-of-stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white uppercase tracking-widest px-3 py-1 rounded-full bg-black/60">
                Out of stock
              </span>
            </div>
          )}

          {/* Hover add-to-cart */}
          {canAddToCart && inStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap h-8 px-4 bg-white text-[#111] text-[12px] font-semibold rounded-full shadow-[0_4px_16px_oklch(0_0_0/0.12)] opacity-0 translate-y-[6px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <><Check className="h-3 w-3 text-green-600" /> Added!</>
              ) : (
                <><ShoppingCart className="h-3 w-3" /> Add to cart</>
              )}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <Pill variant="accent" size="sm">{product.category}</Pill>
          <h3 className="text-[13px] font-medium text-[var(--text-primary)] leading-snug line-clamp-2 flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-display font-extrabold text-base text-[var(--text-primary)]">
              {formatPrice(product.price)}
            </span>
            <Rating value={4.2} size="xs" />
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}
