'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, clearAuthCookie } from '@/store/auth';
import { authApi } from '@/lib/services';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const AUTH_EXEMPT = ['/login', '/register', '/pending-verification', '/verify-email',
                     '/account-suspended', '/account-deleted', '/seller/pending-approval',
                     '/reset-password', '/forgot-password'];

function AuthStatusGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, email } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const checked  = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Skip check on auth pages or if already ran this session
    if (AUTH_EXEMPT.some(p => pathname.startsWith(p)) || !isAuthenticated || !email || checked.current) {
      setReady(true);
      return;
    }
    checked.current = true;

    authApi.checkAccountStatus(email).then(({ status }) => {
      if (status === 'DISABLED') {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        clearAuthCookie();
        router.replace(`/account-suspended?email=${encodeURIComponent(email)}`);
      } else if (status === 'DELETED') {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        clearAuthCookie();
        router.replace(`/account-deleted?email=${encodeURIComponent(email)}`);
      } else {
        setReady(true);
      }
    }).catch(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, email]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStatusGuard>{children}</AuthStatusGuard>
    </QueryClientProvider>
  );
}

