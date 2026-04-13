'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/services';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const size = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, size],
    queryFn: () => productApi.getAll(page, size),
  });

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Browse <span className="gradient-text">Products</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            Discover amazing products from our sellers
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="bg-[var(--bg-secondary)] rounded-xl h-48 mb-4" />
                <div className="bg-[var(--bg-secondary)] rounded h-4 w-3/4 mb-2" />
                <div className="bg-[var(--bg-secondary)] rounded h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data && data.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="glass-card overflow-hidden hover:scale-[1.03] transition-all duration-300 no-underline animate-slide-up group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="h-48 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg-secondary)] flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart size={48} className="text-[var(--accent)]/40" />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-1 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-[var(--success)]">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-outline flex items-center gap-1 px-4 py-2 text-sm disabled:opacity-30"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-[var(--text-secondary)] text-sm">
                  Page {page + 1} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="btn-outline flex items-center gap-1 px-4 py-2 text-sm disabled:opacity-30"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart size={64} className="mx-auto mb-4 text-[var(--text-secondary)]/30" />
            <h3 className="text-xl font-medium mb-2">No products yet</h3>
            <p className="text-[var(--text-secondary)]">Check back later for new arrivals!</p>
          </div>
        )}
      </div>
    </>
  );
}
