'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Users } from 'lucide-react';
import type { ProductDto } from '@shared/types';

const PAGE_SIZE = 30;

function groupBySeller(products: ProductDto[]): Map<string, ProductDto[]> {
  const map = new Map<string, ProductDto[]>();
  for (const p of products) {
    const group = map.get(p.sellerId) ?? [];
    group.push(p);
    map.set(p.sellerId, group);
  }
  return map;
}

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useProducts(page, PAGE_SIZE);
  const grouped = data ? groupBySeller(data.products) : new Map<string, ProductDto[]>();

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Products by seller</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {data
              ? `${data.totalElements} total products · ${grouped.size} seller${grouped.size !== 1 ? 's' : ''} on this page`
              : '—'}
          </p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-48 mb-3 rounded-[var(--radius-xs)]" />
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-none border-b border-[var(--border-subtle)] last:border-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.size === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Products will appear here once sellers start listing items."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([sellerId, products], gi) => (
            <Reveal key={sellerId} delay={gi * 60}>
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--gradient)' }}
                  >
                    <Users className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">
                    Seller <span className="font-mono text-[var(--text-tertiary)]">#{sellerId.slice(0, 8).toUpperCase()}</span>
                  </h2>
                  <Pill size="sm" variant="subtle">{products.length} product{products.length !== 1 ? 's' : ''}</Pill>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                  <div
                    className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                    style={{ background: 'var(--surface)' }}
                  >
                    <span>Product</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Status</span>
                    <span>Listed</span>
                  </div>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: 'var(--surface)' }}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{product.name}</p>
                          <p className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">
                            #{product.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Pill size="sm" variant="subtle">{product.category}</Pill>
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{formatPrice(product.price)}</span>
                      <Pill size="sm" variant={product.active ? 'success' : 'subtle'}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Pill>
                      <span className="text-[12px] text-[var(--text-tertiary)]">{formatDate(product.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}

          {data && data.totalPages > 1 && (
            <Reveal delay={200}>
              <div className="flex items-center justify-between pt-2">
                <p className="text-[13px] text-[var(--text-tertiary)]">
                  Page {page + 1} of {data.totalPages} · {data.totalElements} products total
                </p>
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
              </div>
            </Reveal>
          )}
        </div>
      )}
    </PageLayout>
  );
}
