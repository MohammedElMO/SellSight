'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart, useLoyaltyAccount } from '@/lib/hooks';
import { orderApi, paymentApi, couponApi, cartApi, loyaltyApi } from '@/lib/services';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AddressStep from './address-step';
import PaymentStep from './payment-step';
import { formatPrice } from '@/lib/utils';
import { useTracker } from '@/hooks/useTracker';
import { CheckCircle2, MapPin, CreditCard, ShoppingBag, Tag, Loader2, Award } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function CheckoutClient() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: loyaltyAccount } = useLoyaltyAccount();
  const cartItems = cart?.items ?? [];

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [isApplyingPoints, setIsApplyingPoints] = useState(false);
  const { track } = useTracker();

  const subtotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discount - pointsDiscount);

  useEffect(() => {
    if (!cartLoading && cartItems.length > 0) {
      track('CHECKOUT_START', { cartSize: cartItems.length, total: subtotal });
    }
  }, [track, cartItems.length, subtotal, cartLoading]);

  useEffect(() => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && currentStep !== 3) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [cartItems.length, cartLoading, router, currentStep]);

  const handleAddressNext = async () => {
    setIsPreparingCheckout(true);
    try {
      const order = await orderApi.create({
        items: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      setPendingOrderId(order.id);

      if (finalTotal === 0) {
        await paymentApi.confirmFree(order.id);
        track('PURCHASE', { orderId: order.id, total: 0 });
        await cartApi.clear().catch(() => {});
        setCurrentStep(3);
        return;
      }

      const intent = await paymentApi.createIntent({
        amount: Math.round(finalTotal * 100),
        orderId: order.id,
      });
      setClientSecret(intent.clientSecret ?? '');
      setCurrentStep(2);
    } catch {
      toast.error('Failed to initialize checkout. Please try again.');
    } finally {
      setIsPreparingCheckout(false);
    }
  };

  // Called after Stripe confirms the payment client-side.
  // Order fulfillment (CONFIRMED status, inventory, loyalty earn) is handled server-side via webhook.
  const handleOrderComplete = async (_paymentIntentId: string) => {
    setIsProcessing(true);
    try {
      if (pointsToRedeem >= 100 && pendingOrderId) {
        loyaltyApi.redeem(pointsToRedeem, pendingOrderId).catch(() => {});
      }
      track('PURCHASE', { orderId: pendingOrderId, total: finalTotal });
      await cartApi.clear().catch(() => {});
      setCurrentStep(3);
    } catch {
      toast.error('An unexpected error occurred. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Shipping', icon: MapPin },
    { id: 2, title: 'Payment', icon: CreditCard },
  ];

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center p-20 text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={24} /> Loading your cart...
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-12 mb-24">
        <CheckCircle2 className="mx-auto h-20 w-20 text-[var(--success)] mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-lg">
          Thank you for your purchase. We&apos;ve sent a confirmation email with your order details.
        </p>
        <button onClick={() => router.push('/orders')} className="btn-primary px-8 py-3 text-lg">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Flow */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-2 ${
                  currentStep >= step.id
                    ? 'text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-gray-300'
                  }`}
                >
                  <step.icon size={16} />
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-[var(--accent)]' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Steps Content */}
        <div className="glass-card p-6 min-h-[400px]">
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <AddressStep
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onNext={handleAddressNext}
                isNextLoading={isPreparingCheckout}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Payment Interface</h2>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Back to Shipping
                </button>
              </div>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { theme: 'stripe' } }}
                >
                  <PaymentStep
                    amount={finalTotal}
                    onSuccess={handleOrderComplete}
                    isProcessing={isProcessing}
                  />
                </Elements>
              ) : (
                <div className="flex justify-center items-center p-12 text-gray-500 gap-2">
                  <Loader2 className="animate-spin" size={20} /> Loading secure payment gateway...
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-1">
        <div className="glass-card p-6 sticky top-24">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <ShoppingBag size={20} /> Order Summary
          </h3>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 pr-2">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                  {item.productImageUrl && (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {/* Coupon */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 text-sm h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
                <button
                  onClick={async () => {
                    if (!couponCode) return;
                    setIsApplyingCoupon(true);
                    try {
                      const coupon = await couponApi.validate(couponCode, subtotal);
                      if (coupon.discount > 0) {
                        setDiscount(coupon.discount);
                        toast.success(
                          `Coupon applied — ${
                            coupon.type === 'PERCENTAGE'
                              ? coupon.value + '% off'
                              : '$' + coupon.value + ' off'
                          }!`,
                        );
                      } else {
                        toast.error('This coupon does not apply to your order total');
                      }
                    } catch {
                      toast.error('Invalid or expired coupon');
                    } finally {
                      setIsApplyingCoupon(false);
                    }
                  }}
                  disabled={isApplyingCoupon || !couponCode}
                  className="h-9 px-4 text-sm bg-black text-white rounded font-medium disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-[var(--success)] font-medium">
                <span className="flex items-center gap-1">
                  <Tag size={14} /> Coupon discount
                </span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            {/* Loyalty points */}
            {isAuthenticated && loyaltyAccount && loyaltyAccount.balance > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Award size={14} className="text-[var(--accent-text)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Loyalty Points
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                    {loyaltyAccount.balance} pts available
                  </span>
                </div>
                {pointsDiscount > 0 ? (
                  <div className="flex justify-between items-center text-sm text-[var(--success)] font-medium">
                    <span>{pointsToRedeem} pts redeemed</span>
                    <div className="flex items-center gap-2">
                      <span>-{formatPrice(pointsDiscount)}</span>
                      <button
                        onClick={() => { setPointsDiscount(0); setPointsToRedeem(0); }}
                        className="text-xs text-[var(--danger)] hover:underline"
                      >Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={loyaltyAccount.balance}
                      step={100}
                      placeholder="Points to use"
                      value={pointsToRedeem || ''}
                      onChange={(e) => setPointsToRedeem(Math.min(Number(e.target.value), loyaltyAccount.balance))}
                      className="flex-1 text-sm h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <button
                      onClick={async () => {
                        if (pointsToRedeem < 100) { toast.error('Minimum 100 points'); return; }
                        setIsApplyingPoints(true);
                        try {
                          const dollarsOff = Math.floor(pointsToRedeem / 100);
                          setPointsDiscount(dollarsOff);
                          toast.success(`${pointsToRedeem} pts applied — ${formatPrice(dollarsOff)} off!`);
                        } finally {
                          setIsApplyingPoints(false);
                        }
                      }}
                      disabled={isApplyingPoints || pointsToRedeem < 100}
                      className="h-9 px-4 text-sm rounded font-medium disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">100 pts = $1 off</p>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Shipping</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border)]">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
