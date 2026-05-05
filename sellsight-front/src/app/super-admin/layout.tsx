'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'SUPER_ADMIN') {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated || role !== 'SUPER_ADMIN') return null;

  return <>{children}</>;
}
