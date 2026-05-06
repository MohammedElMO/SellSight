'use client';

import { useState, useRef } from 'react';
import { useProfile, useSellerProducts, useDeleteProduct } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/modal';
import { formatPrice, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Package, ChevronLeft, ChevronRight, Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { productApi } from '@/lib/services';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductDto, BulkCreateResult } from '@shared/types';

const PAGE_SIZE = 25;

const CSV_TEMPLATE = `name,description,price,category,stock,imageUrl
"Blue Wireless Headphones","High quality Bluetooth headphones",49.99,Electronics,20,https://example.com/image.jpg
"Ergonomic Office Chair","Adjustable lumbar support chair",299.00,Furniture,5,`;

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkCreateResult | null>(null);
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await productApi.bulkCreate(file);
      setResult(res);
      if (res.created > 0) {
        queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        toast.success(`${res.created} product${res.created !== 1 ? 's' : ''} created.`);
      }
    } catch {
      toast.error('Failed to upload CSV. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Bulk product upload</h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">CSV format · max 100 products per file</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              <div className="mb-4 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)] mb-1">Required columns:</p>
                <code className="text-[11px]">name, description, price, category, stock</code>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">Optional columns:</p>
                <code className="text-[11px]">imageUrl</code>
              </div>

              <button
                type="button"
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-xs font-medium text-[var(--accent)] border border-[var(--accent)]/30 rounded-[var(--radius-md)] hover:bg-[var(--accent)]/5 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV template
              </button>

              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] cursor-pointer hover:border-[var(--accent)] transition-colors mb-4"
                style={file ? { borderColor: 'var(--success)' } : {}}
              >
                <Upload className="h-8 w-8 text-[var(--text-tertiary)]" />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">Click to select CSV file</p>
                    <p className="text-xs text-[var(--text-tertiary)]">or drag and drop</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
                      toast.error('Only CSV files are accepted.');
                      return;
                    }
                    setFile(f);
                  }
                }}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors"
                >
                  Cancel
                </button>
                <MagButton
                  variant="primary"
                  size="md"
                  disabled={!file || uploading}
                  onClick={handleUpload}
                  className="flex-1"
                >
                  {uploading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : 'Upload'}
                </MagButton>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                {result.created > 0 ? (
                  <CheckCircle className="h-8 w-8 shrink-0" style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertCircle className="h-8 w-8 shrink-0" style={{ color: 'var(--danger)' }} />
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {result.created} created · {result.failed} failed
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {result.created > 0 ? 'Products are now live in your catalog.' : 'No products were created.'}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto mb-4 rounded-[var(--radius-md)] border border-[var(--border)] divide-y divide-[var(--border)]">
                  {result.errors.map((err, i) => (
                    <div key={i} className="px-3 py-2 text-xs">
                      <span className="font-mono text-[var(--text-tertiary)] mr-2">Row {err.row}:</span>
                      <span className="text-[var(--danger)]">{err.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <MagButton variant="primary" size="md" onClick={onClose} className="w-full">
                Done
              </MagButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [page, setPage] = useState(0);
  const [showBulkModal, setShowBulkModal] = useState(false);

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="h-9 px-3.5 flex items-center gap-1.5 text-[13px] font-medium rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Bulk upload
            </button>
            <Link href="/seller/products/new">
              <MagButton variant="primary">
                <Plus className="h-4 w-4" />
                New product
              </MagButton>
            </Link>
          </div>
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

      {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} />}
    </PageLayout>
  );
}
