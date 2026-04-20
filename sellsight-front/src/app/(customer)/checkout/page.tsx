import PageLayout from '@/components/layout/page-layout';
import CheckoutClient from '@/components/checkout/checkout-client';

export default function CheckoutPage() {
  return (
    <PageLayout title="Checkout" raw className="bg-[var(--bg-secondary)] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CheckoutClient />
      </div>
    </PageLayout>
  );
}
