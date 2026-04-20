'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from './product-card';
import type { ProductDto } from '@shared/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductRailProps {
  title: string;
  description?: string;
  products: ProductDto[] | undefined;
  isLoading?: boolean;
}

export function ProductRail({ title, description, products, isLoading }: ProductRailProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="mb-6 px-4 sm:px-6 max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            {description && <Skeleton className="h-4 w-64" />}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-[0_0_280px]">
                <Skeleton className="w-full aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null; // hide empty rails
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
          {description && <p className="text-[var(--text-secondary)] mt-1">{description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] disabled:opacity-50"
            aria-label="Previous items"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] disabled:opacity-50"
            aria-label="Next items"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pl-4 sm:pl-6 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 pb-4">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_240px] sm:flex-[0_0_280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
