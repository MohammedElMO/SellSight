import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

interface PaymentStepProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  isProcessing: boolean;
}

export default function PaymentStep({ amount, onSuccess, isProcessing }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    // In a real application, you'd trigger element.submit() and then confirm the payment
    // using a client secret fetched from your backend. Since we are in test mode and the
    // backend Stripe adapter is a stub or waiting for real keys, we simulate success
    // after basic Stripe Element validation.
    
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred during payment validation.');
        setLoading(false);
        return;
      }
      
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // You'd typically add a return_url if you're using redirect flow,
          // but if we use redirect: "if_required" we can handle it locally.
          return_url: `${window.location.origin}/cart`,
        },
        redirect: 'if_required',
      });
      
      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Call parent success handler with the real PI id
        await onSuccess(paymentIntent.id);
      } else {
        // Requires action or capture, or other non-succeeded state
        setError('Payment requires further action or capture.');
      }
      
    } catch (err) {
      setError('An unexpected error occurred processing your payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Amount Due</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">${amount.toFixed(2)}</p>
        </div>
        <Lock className="text-[var(--text-tertiary)]" size={22} />
      </div>

      <div className="min-h-[200px]">
        {/* Stripe Elements built-in UI */}
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || isProcessing}
        className="group cursor-pointer/clear relative w-full mt-6 h-14 rounded-[var(--radius-md)] overflow-hidden text-white font-bold text-base tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'var(--gradient)' }}
      >
        {/* sliding shimmer on hover */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)' }}
        />
        <span className="relative flex items-center justify-center gap-2">
          {(loading || isProcessing) ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Processing...
            </>
          ) : (
            <>
              <Lock size={16} className="opacity-80" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </span>
      </button>

      <p className="text-xs text-center text-[var(--text-tertiary)] mt-3 flex items-center justify-center gap-1">
        <Lock size={11} /> Payments are secure and encrypted.
      </p>
    </form>
  );
}
