'use client';

import { Heart, X, Plus, Star } from 'lucide-react';
import { useWishlists, useAddToWishlist, useRemoveFromWishlist, useCreateWishlist } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { WishlistDto } from '@shared/types';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { isAuthenticated, role } = useAuthStore();
  const { data: wishlists } = useWishlists();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();
  const createMutation = useCreateWishlist();
  const [showPicker, setShowPicker] = useState(false);
  const [newName, setNewName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  const inWishlist = useMemo(() => {
    if (!wishlists) return null;
    for (const wl of wishlists) {
      const item = wl.items.find((i) => i.productId === productId);
      if (item) return { wishlistId: wl.id, wishlistName: wl.name };
    }
    return null;
  }, [wishlists, productId]);

  const defaultWishlist = useMemo(
    () => wishlists?.find((wl) => wl.isDefault) ?? null,
    [wishlists],
  );

  if (!isAuthenticated || role !== 'CUSTOMER') return null;

  const handleClick = async () => {
    if (inWishlist) {
      removeMutation.mutate({ wishlistId: inWishlist.wishlistId, productId });
      return;
    }

    if (!wishlists || wishlists.length === 0) {
      createMutation.mutate('My Wishlist', {
        onSuccess: (wl) => addMutation.mutate({ wishlistId: wl.id, productId }),
      });
      return;
    }

    if (defaultWishlist) {
      addMutation.mutate({ wishlistId: defaultWishlist.id, productId });
      return;
    }

    setShowPicker(true);
  };

  const pickWishlist = (wl: WishlistDto) => {
    addMutation.mutate(
      { wishlistId: wl.id, productId },
      { onSuccess: () => setShowPicker(false) },
    );
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim(), {
      onSuccess: (wl) => {
        addMutation.mutate({ wishlistId: wl.id, productId });
        setShowPicker(false);
        setNewName('');
        setCreatingNew(false);
      },
    });
  };

  const loading = addMutation.isPending || removeMutation.isPending || createMutation.isPending;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        title={inWishlist ? `Remove from "${inWishlist.wishlistName}"` : 'Add to wishlist'}
        className={cn(
          'inline-flex items-center justify-center h-10 w-10 rounded-full border transition-all duration-200',
          inWishlist
            ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
            : 'bg-white border-[#e5e4e0] text-[#999] hover:border-[#999] hover:text-rose-500',
          loading && 'opacity-50 pointer-events-none',
          className,
        )}
      >
        <Heart size={18} className={cn(inWishlist && 'fill-current')} />
      </button>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => { setShowPicker(false); setCreatingNew(false); setNewName(''); }}
        >
          <div
            className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
                Choose a wishlist
              </h3>
              <button
                onClick={() => { setShowPicker(false); setCreatingNew(false); setNewName(''); }}
                className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:bg-[var(--surface)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {wishlists?.map((wl) => (
                <button
                  key={wl.id}
                  onClick={() => pickWishlist(wl)}
                  disabled={addMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-left hover:bg-[var(--surface)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                >
                  <Heart className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)] truncate">
                    {wl.name}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {wl.items.length} items
                  </span>
                  {wl.isDefault && (
                    <Star className="h-3 w-3 text-amber-400 fill-current shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {creatingNew ? (
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                  placeholder="Wishlist name"
                  autoFocus
                  className="w-full h-9 px-3 text-[13px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] transition-colors mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCreatingNew(false); setNewName(''); }}
                    className="flex-1 h-8 text-[12px] font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--surface)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newName.trim() || createMutation.isPending}
                    className="flex-1 h-8 text-[12px] font-medium text-white bg-[var(--accent)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {createMutation.isPending ? 'Creating…' : 'Create & Add'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreatingNew(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-t border-[var(--border-subtle)] transition-colors pt-3"
              >
                <Plus className="h-3.5 w-3.5" /> New wishlist
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
