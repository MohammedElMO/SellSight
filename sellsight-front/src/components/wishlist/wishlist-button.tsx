'use client';

import { Heart } from 'lucide-react';
import { useWishlists, useAddToWishlist, useRemoveFromWishlist, useCreateWishlist } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

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

  const inWishlist = useMemo(() => {
    if (!wishlists) return null;
    for (const wl of wishlists) {
      const item = wl.items.find((i) => i.productId === productId);
      if (item) return { wishlistId: wl.id };
    }
    return null;
  }, [wishlists, productId]);

  if (!isAuthenticated || role !== 'CUSTOMER') return null;

  const handleClick = async () => {
    if (inWishlist) {
      removeMutation.mutate({ wishlistId: inWishlist.wishlistId, productId });
    } else if (wishlists && wishlists.length > 0) {
      addMutation.mutate({ wishlistId: wishlists[0].id, productId });
    } else {
      // Create default wishlist first, then add
      createMutation.mutate('My Wishlist', {
        onSuccess: (wl) => {
          addMutation.mutate({ wishlistId: wl.id, productId });
        },
      });
    }
  };

  const loading = addMutation.isPending || removeMutation.isPending || createMutation.isPending;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
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
  );
}
