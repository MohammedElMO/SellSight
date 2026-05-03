'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { useSellerProducts, useProfile } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';
import { Package, AlertTriangle, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryApi } from '@/lib/services';

type SortKey = 'name' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

export default function InventoryPage() {
  const { data: profile } = useProfile();
  const [page, setPage] = useState(0);
  const { data: productsData, isLoading, refetch } = useSellerProducts(profile?.id, page, PAGE_SIZE);
  const products = productsData?.products ?? [];
  const totalPages = productsData?.totalPages ?? 0;
  const totalElements = productsData?.totalElements ?? 0;

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleInputChange = (productId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [productId]: value }));
    setDirtyIds(prev => new Set(prev).add(productId));
  };

  const handleUpdate = async (productId: string) => {
    const qty = parseInt(inputValues[productId] ?? '0');
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    setUpdatingId(productId);
    try {
      await inventoryApi.update(productId, { quantity: qty });
      toast.success('Stock updated');
      setDirtyIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
      refetch();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBatchUpdate = async () => {
    const items = [...dirtyIds]
      .filter(id => inputValues[id] !== undefined && inputValues[id] !== '')
      .map(id => ({ productId: id, quantity: parseInt(inputValues[id]) }))
      .filter(i => !isNaN(i.quantity) && i.quantity >= 0);
    if (items.length === 0) { toast.error('No changes to save'); return; }
    try {
      await inventoryApi.batchUpdate(items);
      toast.success(`Updated ${items.length} product(s)`);
      setDirtyIds(new Set());
      setInputValues({});
      refetch();
    } catch {
      toast.error('Batch update failed');
    }
  };

  // Client-side filter and sort within current page
  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price') cmp = a.price - b.price;
      else if (sortKey === 'stock') cmp = a.stockQuantity - b.stockQuantity;
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Inventory</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Monitor and manage stock levels across your products
            </p>
          </div>
          {dirtyIds.size > 0 && (
            <MagButton variant="primary" onClick={handleBatchUpdate}>
              Save {dirtyIds.size} change{dirtyIds.size !== 1 ? 's' : ''}
            </MagButton>
          )}
        </div>
      </Reveal>

      {/* Stats row */}
      <Reveal delay={40}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Total Products</p>
            <p className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1">{totalElements}</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">In Stock</p>
            <p className="font-display font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              {products.filter(p => p.stockQuantity > 5).length}
            </p>
          </div>
          <div className={`bg-[var(--bg-card)] border rounded-[var(--radius)] p-4 ${lowStockCount > 0 ? 'border-[var(--warning)]' : 'border-[var(--border)]'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
              {lowStockCount > 0 && <AlertTriangle className="h-3 w-3 text-[var(--warning)]" />}
              Low Stock
            </p>
            <p className={`font-display font-extrabold text-2xl mt-1 ${lowStockCount > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
              {lowStockCount}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Search */}
      <Reveal delay={60}>
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-9 pr-3 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton rounded-[var(--radius)]" />)}
        </div>
      ) : products.length === 0 && page === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)] font-medium">No products found</p>
        </div>
      ) : (
        <>
          <Reveal delay={80}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
              <div
                className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                style={{ background: 'var(--surface)' }}
              >
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-left">
                  Product <ArrowUpDown className="h-3 w-3" />
                </button>
                <span>Category</span>
                <button onClick={() => handleSort('price')} className="flex items-center gap-1">
                  Price <ArrowUpDown className="h-3 w-3" />
                </button>
                <button onClick={() => handleSort('stock')} className="flex items-center gap-1">
                  Stock <ArrowUpDown className="h-3 w-3" />
                </button>
                <span>Action</span>
              </div>
              {filtered.map((product) => {
                const isLow = product.stockQuantity <= 5;
                const isOut = product.stockQuantity === 0;
                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--surface)] flex items-center justify-center flex-none overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">{product.name}</span>
                    </div>
                    <Pill variant="accent" size="sm">{product.category}</Pill>
                    <span className="font-display font-bold text-[14px] text-[var(--text-primary)]">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder={String(product.stockQuantity)}
                        value={inputValues[product.id] ?? ''}
                        onChange={e => handleInputChange(product.id, e.target.value)}
                        className="w-16 h-8 px-2 text-sm border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      {isOut ? (
                        <Pill variant="danger" size="sm">Out</Pill>
                      ) : isLow ? (
                        <Pill variant="warning" size="sm">Low</Pill>
                      ) : (
                        <Pill variant="success" size="sm">{product.stockQuantity}</Pill>
                      )}
                    </div>
                    <MagButton
                      size="sm"
                      variant="secondary"
                      disabled={updatingId === product.id || !inputValues[product.id]}
                      onClick={() => handleUpdate(product.id)}
                    >
                      Update
                    </MagButton>
                  </div>
                );
              })}
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
                    onClick={() => { setPage(p => Math.max(0, p - 1)); setInputValues({}); setDirtyIds(new Set()); }}
                    disabled={page === 0}
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPage(i); setInputValues({}); setDirtyIds(new Set()); }}
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
                    onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); setInputValues({}); setDirtyIds(new Set()); }}
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
    </PageLayout>
  );
}
