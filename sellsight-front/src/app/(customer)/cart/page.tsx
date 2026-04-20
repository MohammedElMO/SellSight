'use client';

import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from '@/lib/hooks';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingCart, Package, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STEPS = ['Cart', 'Shipping', 'Payment'];

interface NormalizedCartItem {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

export default function CartPage() {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === 'CUSTOMER';
  const router = useRouter();

  // DB cart hooks (only active for CUSTOMER)
  const { data: cart, isLoading: dbCartLoading } = useCart();
  const { mutate: updateDbItem } = useUpdateCartItem();
  const { mutate: removeDbItem } = useRemoveFromCart();
  const { mutate: clearDbCart, isPending: isClearing } = useClearCart();

  // Local (Zustand) cart hooks — for guests
  const localItems = useCartStore((s) => s.items);
  const updateLocalQty = useCartStore((s) => s.updateQuantity);
  const removeLocalItem = useCartStore((s) => s.removeItem);
  const clearLocalCart = useCartStore((s) => s.clearCart);

  // Normalize to a single shape regardless of source
  const items: NormalizedCartItem[] = isCustomer
    ? (cart?.items ?? []).map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productImageUrl: i.productImageUrl,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      }))
    : localItems.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        productImageUrl: i.product.imageUrl,
        unitPrice: i.product.price,
        quantity: i.quantity,
      }));

  const handleUpdate = (productId: string, quantity: number) => {
    if (isCustomer) {
      updateDbItem({ productId, quantity });
    } else {
      updateLocalQty(productId, quantity);
    }
  };

  const handleRemove = (productId: string) => {
    if (isCustomer) {
      removeDbItem(productId);
    } else {
      removeLocalItem(productId);
    }
  };

  const handleClear = () => {
    if (isCustomer) {
      clearDbCart();
    } else {
      clearLocalCart();
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      router.push('/login');
      return;
    }
    if (role !== 'CUSTOMER') {
      toast.error('Only customers can place orders');
      return;
    }
    router.push('/checkout');
  };

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= 30 ? 0 : 5.99;
  const total = subtotal + shipping;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const isLoading = isCustomer && dbCartLoading;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </PageLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PageLayout>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our catalogue and add items to your cart."
          action={
            <Link href="/products">
              <MagButton variant="primary">
                Browse products
                <ArrowRight className="h-4 w-4" />
              </MagButton>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Progress steps */}
      <Reveal>
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                  style={
                    i === 0
                      ? { background: 'var(--accent)', color: 'white' }
                      : {
                          background: 'var(--surface)',
                          color: 'var(--text-tertiary)',
                          border: '1px solid var(--border)',
                        }
                  }
                >
                  {i === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: i === 0 ? 'var(--accent-text)' : 'var(--text-tertiary)' }}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px w-10 mx-3 bg-[var(--border)]" />}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
            Your Cart{' '}
            <span className="text-[var(--text-tertiary)] font-normal text-xl">
              ({itemCount} item{itemCount !== 1 ? 's' : ''})
            </span>
          </h1>
        </div>
      </Reveal>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Item list ── */}
        <div className="flex-1 flex flex-col gap-3">
          {items.map(({ productId, productName, productImageUrl, unitPrice, quantity }, idx) => (
            <Reveal key={productId} delay={idx * 50}>
              <div className="flex gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--border-hover)] transition-all group">
                <Link
                  href={`/products/${productId}`}
                  className="h-24 w-24 rounded-[var(--radius-sm)] overflow-hidden shrink-0 border border-[var(--border-subtle)]"
                  style={{ background: 'var(--surface)' }}
                >
                  {productImageUrl ? (
                    <img
                      src={productImageUrl}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-[var(--text-tertiary)]" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <Link href={`/products/${productId}`}>
                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)] line-clamp-2 hover:text-[var(--accent-text)] transition-colors">
                      {productName}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-2 gap-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdate(productId, quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="h-8 w-10 flex items-center justify-center text-[13px] font-bold text-[var(--text-primary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleUpdate(productId, quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-[16px] text-[var(--text-primary)]">
                        {formatPrice(unitPrice * quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(productId)}
                        className="h-8 w-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] rounded-[var(--radius-xs)] transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={items.length * 50 + 60}>
            <button
              onClick={handleClear}
              disabled={isClearing}
              className="self-start text-[13px] text-[var(--danger)] hover:opacity-80 transition-opacity mt-1"
            >
              Clear all items
            </button>
          </Reveal>
        </div>

        {/* ── Summary panel ── */}
        <Reveal delay={160}>
          <div className="w-full lg:w-[340px] shrink-0">
            <div
              className="rounded-[var(--radius)] p-6 sticky top-24 border border-[var(--border)]"
              style={{ background: 'var(--bg-card)' }}
            >
              <h2 className="font-display font-semibold text-[16px] text-[var(--text-primary)] mb-5">
                Order summary
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-secondary)]">
                    Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-secondary)]">Shipping</span>
                  <span
                    className="font-semibold"
                    style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}
                  >
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Free shipping on orders over $30
                  </p>
                )}
              </div>

              <div className="flex justify-between font-display font-bold text-[17px] text-[var(--text-primary)] pt-4 border-t border-[var(--border-subtle)] mb-5">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <MagButton
                onClick={handleProceedToCheckout}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to checkout'}
                <ArrowRight className="h-4 w-4" />
              </MagButton>

              <p className="text-[12px] text-[var(--text-tertiary)] text-center mt-3">
                Free delivery on orders over $30
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </PageLayout>
  );
}
