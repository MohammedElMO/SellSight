'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, productApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/modal';
import { formatPrice, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { ProductDto } from '@shared/types';

export default function SellerProductsPage() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (role !== 'SELLER' && role !== 'ADMIN') router.replace('/products');
  }, [isAuthenticated, role, router]);

  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
  });

  const { data: productsPage, isLoading } = useQuery({
    queryKey: ['seller-products', profile?.id],
    queryFn: () => productApi.getBySeller(profile!.id, 0, 100),
    enabled: !!profile?.id,
  });

  const { mutate: deleteProduct, isPending: deleting } = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const products = productsPage?.products ?? [];

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7 animate-fade-in">
        <div>
          <h1 className="text-[28px] font-bold text-[#111]">My products</h1>
          <p className="text-sm text-[#666] mt-1">{products.length} listing{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/seller/products/new">
          <Button size="md">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[10px]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create your first product listing to start selling."
          action={
            <Link href="/seller/products/new">
              <Button size="md">
                <Plus className="h-4 w-4" />
                Create product
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="border border-[#e5e4e0] rounded-[14px] overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e4e0] bg-[#f7f6f2]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className={[
                    'border-b border-[#f7f6f2] last:border-0 hover:bg-[#fafaf9] transition-colors',
                  ].join(' ')}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[8px] bg-[#f7f6f2] border border-[#e5e4e0] overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-[#ccc]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#111] line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[#999] line-clamp-1 hidden sm:block">
                          {product.description || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <Badge variant="default" size="sm">{product.category}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#111]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <Badge variant={product.active ? 'success' : 'default'} size="sm">
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[#999] text-xs hidden lg:table-cell">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="h-8 w-8 flex items-center justify-center rounded-[7px] text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] transition-all"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="h-8 w-8 flex items-center justify-center rounded-[7px] text-[#bbb] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteProduct(deleteTarget.id)}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
      />
    </PageLayout>
  );
}
