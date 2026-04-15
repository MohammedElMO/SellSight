'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

const PAGE_SIZE = 16;

export default function ProductsPage() {
  const [page,     setPage]     = useState(0);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useProducts(page, PAGE_SIZE);

  // Client-side filter (search + category) since backend doesn't expose filter params
  const filtered = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !category || p.category === category;
      return matchesSearch && matchesCat && p.active;
    });
  }, [data?.products, search, category]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(0);
  };

  const handleSearchChange = (s: string) => {
    setSearch(s);
    setPage(0);
  };

  return (
    <PageLayout>
      <div className="mb-7 animate-fade-in">
        <h1 className="text-[28px] font-bold text-[#111] mb-1">Shop</h1>
        <p className="text-[#666] text-sm">
          Discover products from quality sellers worldwide
        </p>
      </div>

      <ProductFilters
        search={search}
        category={category}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        totalElements={data?.totalElements}
        className="mb-8"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || category ? 'No products match your filters' : 'No products yet'}
          description={
            search || category
              ? 'Try adjusting your search or selecting a different category.'
              : 'Check back soon — sellers are adding new products daily.'
          }
          action={
            (search || category) ? (
              <button
                onClick={() => { setSearch(''); setCategory(''); }}
                className="h-9 px-4 text-sm font-medium bg-[#111] text-white rounded-[8px] hover:bg-[#333] transition-all"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 animate-fade-in">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination — only when no client filter is active */}
          {!search && !category && data && data.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
