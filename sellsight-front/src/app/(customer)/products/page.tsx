'use client';

import { useState } from 'react';
import { useProducts, useSearchProducts, useDebounce } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters, DEFAULT_FILTERS, type ProductFilterState } from '@/components/product/product-filters';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/ui/reveal';
import { Package } from 'lucide-react';

const PAGE_SIZE = 16;

function buildApiFilters(f: ProductFilterState): Record<string, string> | undefined {
  const params: Record<string, string> = {};
  if (f.category)    params.category  = f.category;
  if (f.minPrice)    params.minPrice  = f.minPrice;
  if (f.maxPrice)    params.maxPrice  = f.maxPrice;
  if (f.minRating)   params.minRating = String(f.minRating);
  if (f.sort && f.sort !== 'newest') params.sort = f.sort;
  return Object.keys(params).length ? params : undefined;
}

export default function ProductsPage() {
  const [page,    setPage]    = useState(0);
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);

  const debouncedSearch = useDebounce(filters.search, 300);
  const isSearching = debouncedSearch.length >= 2;

  const apiFilters = buildApiFilters(filters);
  const hasExtraFilters = !!(apiFilters && Object.keys(apiFilters).length > 0);

  const { data: browseData,  isLoading: browseLoading  } = useProducts(page, PAGE_SIZE, apiFilters);
  const { data: searchData,  isLoading: searchLoading  } = useSearchProducts(debouncedSearch, 0, PAGE_SIZE);

  const isLoading = isSearching ? searchLoading : browseLoading;

  const products   = isSearching ? (searchData?.products ?? []) : (browseData?.products ?? []);
  const totalPages = isSearching ? (searchData?.totalPages ?? 1) : (browseData?.totalPages ?? 1);
  const totalElements = isSearching ? searchData?.totalElements : browseData?.totalElements;

  const handleFilterChange = (next: Partial<ProductFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(0);
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice ||
    filters.maxPrice || filters.minRating > 0 || filters.sort !== 'newest';

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[32px] text-[var(--text-primary)] tracking-[-0.03em]">Shop</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Discover products from quality sellers worldwide</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          totalElements={totalElements}
          className="mb-8"
        />
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasActiveFilters ? 'No products match your filters' : 'No products yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search terms.'
              : 'Check back soon — sellers are adding new products daily.'
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                className="h-9 px-5 text-sm font-semibold text-white rounded-[var(--radius-xs)] hover:opacity-90 transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 30}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {!isSearching && totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
