'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, X, ShoppingBag } from 'lucide-react';
import { useCart, useRemoveFromCart } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MiniCartProps {
  className?: string;
}

export function MiniCart({ className }: MiniCartProps) {
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuthStore();
  const localCartStore = useCartStore();
  const { data: dbCart } = useCart();
  const removeFromCart = useRemoveFromCart();

  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const isCustomer = role === 'CUSTOMER';
  const isLoggedInCustomer = isAuthenticated && isCustomer;

  const items = isLoggedInCustomer
    ? (dbCart?.items ?? [])
    : localCartStore.items.map((i) => ({
        id: 0,
        productId: i.product.id,
        productName: i.product.name,
        productImageUrl: i.product.imageUrl,
        unitPrice: i.product.price,
        quantity: i.quantity,
        savedForLater: false,
        addedAt: '',
      }));

  const totalItems = isLoggedInCustomer
    ? items.reduce((s, i) => s + i.quantity, 0)
    : localCartStore.totalItems();
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const handleRemove = (productId: string) => {
    if (isLoggedInCustomer) {
      removeFromCart.mutate(productId);
    } else {
      localCartStore.removeItem(productId);
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/cart"
        onClick={() => setOpen(false)}
        className={cn(
          'relative h-[34px] w-[34px] flex items-center justify-center rounded-[var(--radius-xs)] transition-all',
          pathname === '/cart'
            ? 'text-[var(--accent-text)] bg-[var(--accent-muted)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]',
        )}
        aria-label={`Cart (${totalItems} items)`}
      >
        <ShoppingCart className="h-[17px] w-[17px]" />
        {totalItems > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] flex items-center justify-center text-white text-[9px] font-bold rounded-full px-[3px] leading-none"
            style={{ background: 'var(--secondary)' }}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Link>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-fade-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ShoppingBag className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">Your cart is empty</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[var(--accent-text)] hover:underline"
              >
                Browse products →
              </Link>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {items.slice(0, 5).map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 hover:bg-[var(--surface)] transition-colors group">
                    <div
                      className="h-12 w-12 rounded-[var(--radius-xs)] overflow-hidden shrink-0 border border-[var(--border-subtle)] flex items-center justify-center"
                      style={{ background: 'var(--surface)' }}
                    >
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate leading-tight">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all"
                        aria-label="Remove item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="px-4 py-2 text-[11px] text-[var(--text-tertiary)] text-center">
                    +{items.length - 5} more item{items.length - 5 > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-[15px] font-bold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-9 flex items-center justify-center text-[13px] font-medium border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all"
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-9 flex items-center justify-center text-[13px] font-semibold text-white rounded-[var(--radius-xs)] transition-all hover:opacity-90"
                    style={{ background: 'var(--gradient)' }}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
