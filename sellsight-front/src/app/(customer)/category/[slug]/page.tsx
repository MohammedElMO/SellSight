'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Package, ArrowLeft } from 'lucide-react';

const PAGE_SIZE = 16;

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  // URL comes in URL-encoded, e.g. %20 for spaces
  const categoryName = decodeURIComponent(params.slug || '');
  
  const [page, setPage] = useState(0);
  const { data, isLoading } = useProducts(page, PAGE_SIZE);

  // Client-side category filtering
  const filtered = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((p) => {
      // Case insensitive match so /category/electronics matches "Electronics"
      return p.category?.toLowerCase() === categoryName.toLowerCase() && p.active;
    });
  }, [data?.products, categoryName]);

  return (
    <PageLayout>
      <div className="mb-7 animate-fade-in flex flex-col gap-2">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors self-start mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all products
        </button>
        <h1 className="text-[28px] font-bold text-[#111] capitalize">
          {categoryName}
        </h1>
        <p className="text-[#666] text-sm">
          Browse all items in the {categoryName} collection
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title={`No products found in ${categoryName}`}
            description="Check back later as our sellers add new items."
            action={
              <button
                onClick={() => router.push('/products')}
                className="h-9 px-4 text-sm font-semibold bg-[#111] text-white rounded-[8px] hover:bg-[#333] transition-all"
              >
                Clear filter
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 animate-fade-in">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Simple pagination state binding since we filter client-side, 
              if there's more pages we let them fetch next page and let client filter apply.
              Ideally backend handles category='Electronics' param directly, but for now we fallback correctly. */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
