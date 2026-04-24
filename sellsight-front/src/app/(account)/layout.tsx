'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountSidebar } from '@/components/layout/account-sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { Loader2 } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, emailVerified, email } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!isAuthenticated || role !== 'CUSTOMER') {
      router.replace('/login');
    } else if (!emailVerified) {
      router.replace(`/pending-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`);
    }
  }, [isAuthenticated, role, emailVerified, email, router, isClient]);

  if (!isClient || !isAuthenticated || role !== 'CUSTOMER' || !emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <PageLayout raw style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </PageLayout>
  );
}
