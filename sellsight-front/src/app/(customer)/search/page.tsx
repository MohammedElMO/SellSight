'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts, useSearchProducts, useDebounce } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { ProductFilters, DEFAULT_FILTERS, type ProductFilterState } from '@/components/product/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Search, X } from 'lucide-react';

const PAGE_SIZE = 24;

function buildApiFilters(q: string, f: ProductFilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (q)           params.q        = q;
  if (f.category)  params.category = f.category;
  if (f.minPrice)  params.minPrice = f.minPrice;
  if (f.maxPrice)  params.maxPrice = f.maxPrice;
  if (f.minRating) params.minRating = String(f.minRating);
  if (f.sort && f.sort !== 'newest') params.sort = f.sort;
  return params;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const initialQ     = searchParams.get('q') ?? '';

  const [inputQ,   setInputQ]   = useState(initialQ);
  const [page,     setPage]     = useState(0);
  const [filters,  setFilters]  = useState<ProductFilterState>(DEFAULT_FILTERS);

  const debouncedQ = useDebounce(inputQ, 300);
  const isSearching = debouncedQ.length >= 2;

  // Use full-text search when there's a query, else browse with filters
  const { data: searchData, isLoading: searchLoading } = useSearchProducts(debouncedQ, page, PAGE_SIZE);
  const apiFilters = buildApiFilters('', filters);
  const { data: browseData, isLoading: browseLoading } = useProducts(page, PAGE_SIZE, Object.keys(apiFilters).length ? apiFilters : undefined);

  const data      = isSearching ? searchData  : browseData;
  const isLoading = isSearching ? searchLoading : browseLoading;

  const products     = data?.products ?? [];
  const total        = data?.totalElements ?? 0;
  const totalPages   = data?.totalPages ?? 1;

  useEffect(() => { setPage(0); }, [debouncedQ, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputQ) params.set('q', inputQ);
    router.push(`/search?${params}`);
  };

  const clearQuery = () => {
    setInputQ('');
    router.push('/search');
  };

  const handleFilterChange = (next: Partial<ProductFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(0);
  };

  return (
    <PageLayout>
      {/* Search bar */}
      <Reveal>
        <form onSubmit={handleSearch} className="mb-6">
          <div
            className="flex items-center gap-3 h-14 px-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--accent)] transition-colors"
            style={{ boxShadow: '0 2px 12px var(--accent-glow)' }}
          >
            <Search className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            />
            {inputQ && (
              <button type="button" onClick={clearQuery} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            <MagButton type="submit" variant="primary" size="sm">Search</MagButton>
          </div>
        </form>
      </Reveal>

      {/* Results header */}
      <Reveal delay={40}>
        <div className="mb-5">
          <h1 className="font-display font-extrabold text-[22px] text-[var(--text-primary)] tracking-[-0.02em]">
            {initialQ ? (
              <>Results for <span style={{ color: 'var(--accent-text)' }}>"{initialQ}"</span></>
            ) : 'All products'}
          </h1>
        </div>
      </Reveal>

      {/* Filters (hide search bar since we have the big one above) */}
      <Reveal delay={60}>
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          totalElements={total}
          hideSearch
          className="mb-8"
        />
      </Reveal>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Reveal delay={100}>
          <div
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-[var(--radius-lg)] text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Search className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="font-semibold text-[16px] text-[var(--text-secondary)] mb-2">No products found</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-6">
              {initialQ ? `No results for "${initialQ}". Try different terms or adjust filters.` : 'Start searching or browse with filters above.'}
            </p>
            {(initialQ || filters.category || filters.minPrice || filters.minRating > 0) && (
              <MagButton variant="secondary" onClick={() => { clearQuery(); handleFilterChange(DEFAULT_FILTERS); }}>
                Clear all
              </MagButton>
            )}
          </div>
        </Reveal>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 30}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
