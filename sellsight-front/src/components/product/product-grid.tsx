'use client';

import { Reveal } from '@/components/ui/reveal';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import type { ProductDto } from '@shared/types';

interface ProductGridProps {
  products: ProductDto[];
  loading?: boolean;
  skeletonCount?: number;
  /** Mark the first product as featured (larger card on desktop). */
  featureFirst?: boolean;
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 12,
  featureFirst = true,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 grid-flow-dense">
      {products.map((product, i) => {
        const featured = featureFirst && i === 0;
        return (
          <Reveal
            key={product.id}
            delay={i * 28}
            className={featured ? 'sm:col-span-2 sm:row-span-2' : undefined}
          >
            <ProductCard product={product} variant={featured ? 'featured' : 'default'} />
          </Reveal>
        );
      })}
    </div>
  );
}
