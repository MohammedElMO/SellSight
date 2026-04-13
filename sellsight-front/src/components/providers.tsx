'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

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
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #2a2a4a',
          },
        }}
      />
    </QueryClientProvider>
  );
}
