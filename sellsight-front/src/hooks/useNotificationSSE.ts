'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

export function useNotificationSSE() {
  const { isAuthenticated, role } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'CUSTOMER' || !token) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/stream?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [isAuthenticated, role, token, queryClient]);
}
