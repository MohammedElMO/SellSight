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
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Amount Due</p>
          <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
        </div>
        <Lock className="text-gray-400" size={24} />
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
        className="btn-primary w-full py-4 text-lg mt-6 relative"
      >
        {(loading || isProcessing) ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Processing...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
        <Lock size={12} /> Payments are secure and encrypted.
      </p>
    </form>
  );
}
