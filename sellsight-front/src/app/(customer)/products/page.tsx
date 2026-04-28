'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { useProducts, useSearchProducts, useDebounce } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ShopHeader } from '@/components/product/shop-header';
import { SearchAndSortBar } from '@/components/product/search-sort-bar';
import { CategoryTabs } from '@/components/product/category-tabs';
import { FilterDrawer } from '@/components/product/filter-drawer';
import { ActiveFilterChips } from '@/components/product/active-filter-chips';
import { ProductGrid } from '@/components/product/product-grid';
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  type ProductFilterState,
} from '@/components/product/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';

const PAGE_SIZE = 16;

function buildApiFilters(f: ProductFilterState): Record<string, string> | undefined {
  const params: Record<string, string> = {};
  if (f.category)                params.category    = f.category;
  if (f.minPrice)                params.minPrice    = f.minPrice;
  if (f.maxPrice)                params.maxPrice    = f.maxPrice;
  if (f.minRating)               params.minRating   = String(f.minRating);
  if (f.inStockOnly)             params.inStock     = 'true';
  if (f.sort && f.sort !== 'newest') params.sort    = f.sort;
  return Object.keys(params).length ? params : undefined;
}

export default function ProductsPage() {
  const [page, setPage]         = useState(0);
  const [filters, setFilters]   = useState<ProductFilterState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawer] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);
  const isSearching     = debouncedSearch.length >= 2;

  const apiFilters = buildApiFilters(filters);

  const { data: browseData,  isLoading: browseLoading } = useProducts(page, PAGE_SIZE, apiFilters);
  const { data: searchData,  isLoading: searchLoading } = useSearchProducts(debouncedSearch, 0, PAGE_SIZE);

  const isLoading     = isSearching ? searchLoading : browseLoading;
  const products      = isSearching ? (searchData?.products ?? []) : (browseData?.products ?? []);
  const totalPages    = isSearching ? (searchData?.totalPages ?? 1) : (browseData?.totalPages ?? 1);
  const totalElements = isSearching ? searchData?.totalElements : browseData?.totalElements;

  const updateFilters = (next: Partial<ProductFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(0);
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters  = activeFilterCount > 0 || filters.search.length > 0;

  return (
    <PageLayout>
      <ShopHeader totalElements={totalElements} isSearching={isSearching} />

      <SearchAndSortBar
        search={filters.search}
        sort={filters.sort}
        activeFilterCount={activeFilterCount}
        onSearchChange={(s) => updateFilters({ search: s })}
        onSortChange={(s) => updateFilters({ sort: s })}
        onOpenFilters={() => setDrawer(true)}
      />

      <CategoryTabs
        active={filters.category}
        onChange={(cat) => updateFilters({ category: cat })}
      />

      <ActiveFilterChips
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAll}
      />

      {isLoading ? (
        <ProductGrid loading skeletonCount={PAGE_SIZE} products={[]} />
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
                onClick={clearAll}
                className="h-10 px-5 text-sm font-semibold text-white rounded-[var(--radius-sm)] hover:opacity-90 transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ProductGrid products={products} featureFirst={!isSearching && page === 0} />

          {!isSearching && totalPages > 1 && (
            <div className="flex justify-center mt-14">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAll}
      />
    </PageLayout>
  );
}
