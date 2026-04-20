'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/services';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { Heart, Plus, Trash2, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function WishlistsPage() {
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: wishlists, isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: wishlistApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => wishlistApi.create(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlists'] });
      setShowCreateModal(false);
      setNewName('');
      toast.success('Wishlist created');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ wishlistId, productId }: { wishlistId: string; productId: string }) =>
      wishlistApi.removeItem(wishlistId, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Removed from wishlist');
    },
  });

  return (
    <div className="w-full">
      <Reveal>
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">My Wishlists</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Products you've saved for later</p>
          </div>
          <MagButton variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> New Wishlist
          </MagButton>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 animate-pulse">
              <div className="h-5 w-40 bg-[var(--surface)] rounded mb-4" />
              <div className="h-4 w-60 bg-[var(--surface)] rounded" />
            </div>
          ))}
        </div>
      ) : !wishlists?.length ? (
        <Reveal delay={60}>
          <div
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[var(--radius-lg)] text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Heart className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <h3 className="font-semibold text-[16px] text-[var(--text-secondary)] mb-2">No wishlists yet</h3>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-6">Create a wishlist to start saving products!</p>
            <MagButton variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Wishlist
            </MagButton>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {wishlists.map((wl, i) => (
            <Reveal key={wl.id} delay={i * 60}>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                <div
                  className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between"
                  style={{ background: 'var(--surface)' }}
                >
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)] flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[var(--danger)]" /> {wl.name}
                  </h3>
                  <Pill size="sm" variant="subtle">{wl.items.length} {wl.items.length === 1 ? 'item' : 'items'}</Pill>
                </div>

                {wl.items.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">
                    No items in this wishlist.{' '}
                    <Link href="/products" className="text-[var(--accent-text)] hover:underline">Browse products</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {wl.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-[var(--surface)] transition-colors">
                        <div
                          className="w-14 h-14 rounded-[var(--radius-sm)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-subtle)]"
                          style={{ background: 'var(--surface)' }}
                        >
                          {item.productImageUrl ? (
                            <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-[var(--text-tertiary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-[13px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-[13px] font-bold mt-0.5" style={{ color: 'var(--success)' }}>
                            ${Number(item.productPrice).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemMutation.mutate({ wishlistId: wl.id, productId: item.productId })}
                          className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[16px] text-[var(--text-primary)]">New Wishlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:bg-[var(--surface)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate(newName.trim())}
              className="w-full h-10 px-3.5 text-[13px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] transition-colors mb-4"
              placeholder="Wishlist name"
              autoFocus
            />
            <MagButton
              variant="primary"
              className="w-full"
              onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
              disabled={!newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </MagButton>
          </div>
        </div>
      )}
    </div>
  );
}
