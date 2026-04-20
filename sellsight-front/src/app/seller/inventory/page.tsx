'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { useSellerProducts, useProfile } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import { Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryApi } from '@/lib/services';

export default function InventoryPage() {
  const { email } = useAuthStore();
  const { data: profile } = useProfile();
  const { data: productsData, isLoading, refetch } = useSellerProducts(profile?.id);
  const products = productsData?.products ?? [];

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleUpdate = async (productId: string) => {
    const qty = parseInt(inputValues[productId] ?? '0');
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    setUpdatingId(productId);
    try {
      await inventoryApi.update(productId, { quantity: qty });
      toast.success('Stock updated');
      refetch();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Inventory</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Monitor and manage stock levels across your products</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton rounded-[var(--radius)]" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)] font-medium">No products found</p>
        </div>
      ) : (
        <Reveal delay={80}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            <div
              className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ background: 'var(--surface)' }}
            >
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Action</span>
            </div>
            {products.map((product, i) => (
              <div
                key={product.id}
                className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--surface)] flex items-center justify-center flex-none">
                    <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
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
                    placeholder="qty"
                    value={inputValues[product.id] ?? ''}
                    onChange={e => setInputValues(prev => ({ ...prev, [product.id]: e.target.value }))}
                    className="w-16 h-8 px-2 text-sm border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
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
            ))}
          </div>
        </Reveal>
      )}
    </PageLayout>
  );
}
