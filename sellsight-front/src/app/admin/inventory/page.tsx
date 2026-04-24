'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { productApi, inventoryApi } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import type { ProductDto } from '@shared/types';
import { toast } from 'sonner';
import {
  Search, Package, Minus, Plus, Save, AlertTriangle,
  CheckSquare, Square, RefreshCw, X,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────

type StockStatus = 'out' | 'low' | 'ok';

function stockStatus(qty: number): StockStatus {
  if (qty === 0) return 'out';
  if (qty <= 5)  return 'low';
  return 'ok';
}

function StockBadge({ qty }: { qty: number }) {
  const s = stockStatus(qty);
  return (
    <Pill size="sm" variant={s === 'out' ? 'danger' : s === 'low' ? 'warning' : 'success'}>
      {s === 'out' ? 'Out of stock' : s === 'low' ? `Low (${qty})` : `In stock (${qty})`}
    </Pill>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const qc = useQueryClient();

  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [filter, setFilter]             = useState<'all' | 'out' | 'low'>('all');
  const [pendingQty, setPendingQty]     = useState<Record<string, number>>({});
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [batchQtyInput, setBatchQtyInput] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebounced(search), 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-inventory', debouncedSearch],
    queryFn: () =>
      debouncedSearch.trim()
        ? productApi.search(debouncedSearch, 0, 50)
        : productApi.getAll(0, 100),
    staleTime: 30_000,
  });

  const products: ProductDto[] = productsData?.products ?? [];

  const displayed = useMemo(() => {
    if (filter === 'out') return products.filter((p) => p.stockQuantity === 0);
    if (filter === 'low') return products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5);
    return products;
  }, [products, filter]);

  const outCount = products.filter((p) => p.stockQuantity === 0).length;
  const lowCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;

  // ── Mutations ───────────────────────────────────────────────

  const updateOne = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      inventoryApi.update(productId, { quantity }),
    onSuccess: (_, { productId }) => {
      setPendingQty((p) => { const n = { ...p }; delete n[productId]; return n; });
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Stock updated');
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const batchUpdate = useMutation({
    mutationFn: (items: { productId: string; quantity: number }[]) =>
      inventoryApi.batchUpdate(items),
    onSuccess: (results) => {
      setPendingQty({});
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success(`${results.length} products updated`);
    },
    onError: () => toast.error('Batch update failed'),
  });

  // ── Pending quantity helpers ─────────────────────────────────

  const getQty = useCallback(
    (p: ProductDto) => pendingQty[p.id] ?? p.stockQuantity,
    [pendingQty],
  );

  const setQty = useCallback((productId: string, value: number) => {
    setPendingQty((prev) => ({ ...prev, [productId]: Math.max(0, value) }));
  }, []);

  const isDirty = useCallback(
    (p: ProductDto) => pendingQty[p.id] !== undefined && pendingQty[p.id] !== p.stockQuantity,
    [pendingQty],
  );

  const dirtyItems = products.filter(isDirty);

  // ── Selection ────────────────────────────────────────────────

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (selected.size === displayed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayed.map((p) => p.id)));
    }
  };

  const applyBatchQty = () => {
    const qty = parseInt(batchQtyInput);
    if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity ≥ 0'); return; }
    const updates: Record<string, number> = { ...pendingQty };
    selected.forEach((id) => { updates[id] = qty; });
    setPendingQty(updates);
    setBatchQtyInput('');
  };

  const saveAll = () => {
    if (!dirtyItems.length) return;
    batchUpdate.mutate(dirtyItems.map((p) => ({ productId: p.id, quantity: pendingQty[p.id]! })));
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Inventory
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Search, monitor and bulk-update stock across all products
            </p>
          </div>

          {dirtyItems.length > 0 && (
            <div className="sm:ml-auto flex items-center gap-3">
              <span className="text-[13px] text-[var(--text-secondary)]">
                {dirtyItems.length} unsaved change{dirtyItems.length !== 1 ? 's' : ''}
              </span>
              <MagButton
                variant="secondary" size="sm"
                onClick={() => setPendingQty({})}
              >
                <X className="h-3.5 w-3.5" /> Discard
              </MagButton>
              <MagButton
                variant="primary" size="sm"
                disabled={batchUpdate.isPending}
                onClick={saveAll}
              >
                <Save className="h-3.5 w-3.5" />
                {batchUpdate.isPending ? 'Saving…' : 'Save all changes'}
              </MagButton>
            </div>
          )}
        </div>
      </Reveal>

      {/* ── Alert bar ── */}
      {(outCount > 0 || lowCount > 0) && (
        <Reveal delay={40}>
          <div
            className="flex flex-wrap items-center gap-4 px-5 py-3.5 rounded-[var(--radius)] mb-5 border"
            style={{ background: 'rgba(239,68,68,.06)', borderColor: 'rgba(239,68,68,.2)' }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--danger)' }} />
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              {outCount > 0 && <><strong>{outCount}</strong> product{outCount !== 1 ? 's' : ''} out of stock</>}
              {outCount > 0 && lowCount > 0 && ' · '}
              {lowCount > 0 && <><strong>{lowCount}</strong> product{lowCount !== 1 ? 's' : ''} running low</>}
            </span>
            <div className="flex gap-2 sm:ml-auto">
              {outCount > 0 && (
                <button
                  onClick={() => setFilter('out')}
                  className="text-[12px] font-semibold underline underline-offset-2"
                  style={{ color: 'var(--danger)' }}
                >
                  View out-of-stock
                </button>
              )}
              {lowCount > 0 && (
                <button
                  onClick={() => setFilter('low')}
                  className="text-[12px] font-semibold underline underline-offset-2"
                  style={{ color: 'var(--warning)' }}
                >
                  View low-stock
                </button>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Search + filter bar ── */}
      <Reveal delay={60}>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products (vector search)…"
              className="w-full h-11 pl-10 pr-4 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="h-11 px-4 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all capitalize"
                style={filter === f
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {f === 'all' ? `All (${products.length})` : f === 'low' ? `Low (${lowCount})` : `Out (${outCount})`}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            className="h-11 w-11 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] hover:border-[var(--accent)] transition-all shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </Reveal>

      {/* ── Batch controls ── */}
      {selected.size > 0 && (
        <Reveal>
          <div
            className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-[var(--radius)] mb-4 border"
            style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent)' }}
          >
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              {selected.size} selected
            </span>
            <span className="text-[var(--text-tertiary)] text-xs">—</span>
            <span className="text-[13px] text-[var(--text-secondary)]">Set quantity to:</span>
            <input
              type="number"
              min={0}
              value={batchQtyInput}
              onChange={(e) => setBatchQtyInput(e.target.value)}
              placeholder="0"
              className="w-20 h-8 px-3 text-sm border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <MagButton size="sm" variant="primary" onClick={applyBatchQty} disabled={!batchQtyInput}>
              Apply to selected
            </MagButton>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear selection
            </button>
          </div>
        </Reveal>
      )}

      {/* ── Table ── */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)] font-medium">No products found</p>
        </div>
      ) : (
        <Reveal delay={80}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            {/* Header */}
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{
                background: 'var(--surface)',
                gridTemplateColumns: '32px 2.5fr 1fr 0.8fr 160px 1fr 80px',
              }}
            >
              <button onClick={toggleAll} className="flex items-center">
                {selected.size === displayed.length && displayed.length > 0
                  ? <CheckSquare className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  : <Square className="h-4 w-4" />}
              </button>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Rows */}
            {displayed.map((product) => {
              const qty = getQty(product);
              const dirty = isDirty(product);
              const saving = updateOne.isPending && updateOne.variables?.productId === product.id;

              return (
                <div
                  key={product.id}
                  className="grid gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center transition-colors"
                  style={{
                    gridTemplateColumns: '32px 2.5fr 1fr 0.8fr 160px 1fr 80px',
                    background: dirty ? 'var(--accent-muted)' : selected.has(product.id) ? 'var(--surface)' : undefined,
                  }}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(product.id)}>
                    {selected.has(product.id)
                      ? <CheckSquare className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      : <Square className="h-4 w-4 text-[var(--text-tertiary)]" />}
                  </button>

                  {/* Product */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-[var(--radius-xs)] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <Package className="h-4 w-4 text-[var(--text-tertiary)]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{product.name}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate">{product.id.slice(0, 8)}…</p>
                    </div>
                  </div>

                  {/* Category */}
                  <Pill variant="accent" size="sm">{product.category}</Pill>

                  {/* Price */}
                  <span className="font-display font-bold text-[14px] text-[var(--text-primary)]">
                    {formatPrice(product.price)}
                  </span>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => setQty(product.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center text-sm font-bold border rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                      style={{ borderColor: dirty ? 'var(--accent)' : 'var(--border)' }}
                    />
                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Status */}
                  <StockBadge qty={qty} />

                  {/* Save */}
                  <MagButton
                    size="sm"
                    variant={dirty ? 'primary' : 'secondary'}
                    disabled={!dirty || saving}
                    onClick={() => updateOne.mutate({ productId: product.id, quantity: qty })}
                  >
                    {saving ? (
                      <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                  </MagButton>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </PageLayout>
  );
}
