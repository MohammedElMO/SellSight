'use client';

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import type { ProductDto } from '@shared/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ProductDto;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const role    = useAuthStore((s) => s.role);

  const canAddToCart = role !== 'SELLER' && role !== 'ADMIN';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Added to cart`, { duration: 1500 });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 rounded-[14px]"
    >
      {/* Image container */}
      <div className="relative overflow-hidden rounded-[12px] bg-[#f7f6f2] aspect-square mb-3.5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Package className="h-10 w-10 text-[#ccc]" />
            <span className="text-xs text-[#bbb] font-medium">
              {product.category}
            </span>
          </div>
        )}

        {/* Add to cart hover button — customers only */}
        {canAddToCart && (
          <button
            onClick={handleAddToCart}
            className={[
              'absolute bottom-3 left-1/2 -translate-x-1/2',
              'flex items-center gap-1.5 whitespace-nowrap',
              'h-9 px-4 bg-white text-[#111] text-xs font-semibold rounded-full',
              'border border-[#e5e4e0] shadow-[0_2px_8px_rgba(0,0,0,0.1)]',
              'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
              'transition-all duration-200 hover:bg-[#111] hover:text-white hover:border-[#111]',
            ].join(' ')}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to cart
          </button>
        )}
      </div>

      {/* Details */}
      <div className="px-0.5">
        <Badge variant="default" size="sm" className="mb-1.5">
          {product.category}
        </Badge>
        <h3 className="text-sm font-medium text-[#111] leading-snug line-clamp-2 mb-2 group-hover:text-[#333] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold text-[#111]">
            {formatPrice(product.price)}
          </span>
          <Rating value={4.2} size="xs" />
        </div>
      </div>
    </Link>
  );
}
