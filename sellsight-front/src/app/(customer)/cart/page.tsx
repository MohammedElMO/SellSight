'use client';

import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useCreateOrder } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  const { mutate: placeOrder, isPending } = useCreateOrder();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order');
      router.push('/login');
      return;
    }
    if (role !== 'CUSTOMER') {
      toast.error('Only customers can place orders');
      return;
    }

    placeOrder({
      items: items.map((item) => ({
        productId:   item.product.id,
        productName: item.product.name,
        quantity:    item.quantity,
        unitPrice:   item.product.price,
      })),
    });
  };

  const subtotal  = totalPrice();
  const shipping  = subtotal >= 30 ? 0 : 5.99;
  const total     = subtotal + shipping;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) {
    return (
      <PageLayout>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our catalogue and add items to your cart."
          action={
            <Link
              href="/products"
              className="h-10 px-5 flex items-center gap-2 text-sm font-semibold bg-[#111] text-white rounded-[9px] hover:bg-[#333] transition-all"
            >
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-[#111]">
          Cart{' '}
          <span className="text-[#999] font-normal text-xl">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Item list ── */}
        <div className="flex-1 flex flex-col gap-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 border border-[#e5e4e0] rounded-[14px] bg-white hover:border-[#ccc9c2] transition-all"
            >
              <Link
                href={`/products/${product.id}`}
                className="h-24 w-24 rounded-[10px] bg-[#f7f6f2] overflow-hidden shrink-0 border border-[#e5e4e0]"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-[#ccc]" />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#999] mb-0.5">{product.category}</p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-[#111] line-clamp-2 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center justify-between mt-2 gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="h-8 w-8 flex items-center justify-center border border-[#e5e4e0] rounded-[7px] text-[#666] hover:border-[#111] hover:text-[#111] transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="h-8 w-10 flex items-center justify-center text-sm font-semibold text-[#111] border border-[#e5e4e0] rounded-[7px]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center border border-[#e5e4e0] rounded-[7px] text-[#666] hover:border-[#111] hover:text-[#111] transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-semibold text-[#111]">
                      {formatPrice(product.price * quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="h-8 w-8 flex items-center justify-center text-[#bbb] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-[7px] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="self-start text-sm text-[#dc2626] hover:text-[#b91c1c] transition-colors mt-2"
          >
            Clear all items
          </button>
        </div>

        {/* ── Summary panel ── */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="border border-[#e5e4e0] rounded-[16px] p-6 sticky top-20">
            <h2 className="text-base font-semibold text-[#111] mb-5">Order summary</h2>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">
                  Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </span>
                <span className="text-[#111] font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Shipping</span>
                <span className={shipping === 0 ? 'text-[#16a34a] font-medium' : 'text-[#111] font-medium'}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[#999]">
                  Free shipping on orders over $30
                </p>
              )}
            </div>

            <div className="flex justify-between text-base font-bold text-[#111] pt-4 border-t border-[#f0efeb] mb-5">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              onClick={handleCheckout}
              loading={isPending}
              fullWidth
              size="lg"
            >
              {isAuthenticated ? 'Place order' : 'Sign in to checkout'}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-xs text-[#999] text-center mt-3">
              Free delivery on orders over $30
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
