'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
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
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (role !== 'ADMIN') router.replace('/');
  }, [isAuthenticated, role, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productApi.getAll(page, PAGE_SIZE),
    enabled: isAuthenticated && role === 'ADMIN',
  });

  const grouped = data ? groupBySeller(data.products) : new Map<string, ProductDto[]>();

  return (
    <PageLayout>
      <div className="mb-7 animate-fade-in">
        <h1 className="text-[28px] font-bold text-[#111]">Products by seller</h1>
        <p className="text-sm text-[#666] mt-1">
          {data ? `${data.totalElements} total products across ${grouped.size} seller${grouped.size !== 1 ? 's' : ''} on this page` : '—'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-48 mb-3 rounded-[8px]" />
              <div className="border border-[#e5e4e0] rounded-[14px] overflow-hidden">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-none border-b border-[#f0efeb] last:border-0" />
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
        <div className="flex flex-col gap-8 animate-fade-in">
          {Array.from(grouped.entries()).map(([sellerId, products]) => (
            <section key={sellerId}>
              {/* Seller header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-[#111] flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-[#111]">
                  Seller{' '}
                  <span className="font-mono text-[#555]">#{sellerId.slice(0, 8).toUpperCase()}</span>
                </h2>
                <Badge variant="default" size="sm">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Products table */}
              <div className="border border-[#e5e4e0] rounded-[14px] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e4e0] bg-[#f7f6f2]">
                      {['Product', 'Category', 'Price', 'Status', 'Listed'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider first:pl-5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-[#f7f6f2] last:border-0 hover:bg-[#fafaf9] transition-colors"
                      >
                        <td className="pl-5 pr-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-[8px] bg-[#f7f6f2] border border-[#e5e4e0] overflow-hidden shrink-0 flex items-center justify-center">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-[#ccc]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#111] truncate max-w-[220px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-[#999] font-mono mt-0.5">
                                #{product.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="default" size="sm">{product.category}</Badge>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#111]">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3.5">
                          {product.active ? (
                            <Badge variant="success" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#999]">
                          {formatDate(product.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-[#999]">
                Page {page + 1} of {data.totalPages} &middot; {data.totalElements} products total
              </p>
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
