'use client';

import { useState } from 'react';
import { useProfile, useSellerProducts, useDeleteProduct } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/modal';
import { formatPrice, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ProductDto } from '@shared/types';

const PAGE_SIZE = 25;

export default function SellerProductsPage() {
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [page, setPage] = useState(0);

  const { data: profile } = useProfile();
  const { data: productsPage, isLoading } = useSellerProducts(profile?.id, page, PAGE_SIZE);
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

  const products = productsPage?.products ?? [];
  const totalPages = productsPage?.totalPages ?? 0;
  const totalElements = productsPage?.totalElements ?? 0;

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">My products</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{totalElements} listing{totalElements !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/seller/products/new">
            <MagButton variant="primary">
              <Plus className="h-4 w-4" />
              New product
            </MagButton>
          </Link>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />
          ))}
        </div>
      ) : products.length === 0 && page === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create your first product listing to start selling."
          action={
            <Link href="/seller/products/new">
              <MagButton variant="primary">
                <Plus className="h-4 w-4" />
                Create product
              </MagButton>
            </Link>
          }
        />
      ) : (
        <>
          <Reveal delay={60}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
              <div
                className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_0.6fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                style={{ background: 'var(--surface)' }}
              >
                <span>Product</span>
                <span className="hidden sm:block">Category</span>
                <span>Price</span>
                <span className="hidden md:block">Status</span>
                <span className="hidden lg:block">Created</span>
                <span className="text-right">Actions</span>
              </div>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_0.6fr] gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-9 w-9 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] overflow-hidden shrink-0"
                      style={{ background: 'var(--surface)' }}
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{product.name}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate hidden sm:block">
                        {product.description || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Pill size="sm" variant="subtle">{product.category}</Pill>
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {formatPrice(product.price)}
                  </span>
                  <div className="hidden md:block">
                    <Pill size="sm" variant={product.active ? 'success' : 'subtle'}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Pill>
                  </div>
                  <span className="text-[12px] text-[var(--text-tertiary)] hidden lg:block">
                    {formatDate(product.createdAt)}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-muted)] transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Pagination */}
          {totalPages > 1 && (
            <Reveal delay={100}>
              <div className="flex items-center justify-between mt-5">
                <p className="text-[12px] text-[var(--text-tertiary)]">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className="h-8 min-w-8 px-2 flex items-center justify-center rounded-[var(--radius-xs)] text-[12px] font-medium transition-all"
                      style={
                        page === i
                          ? { background: 'var(--accent)', color: 'white' }
                          : { color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                      }
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 2), page + 3)}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Reveal>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget &&
          deleteProduct(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
      />
    </PageLayout>
  );
}
