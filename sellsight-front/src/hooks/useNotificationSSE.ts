'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

export function useNotificationSSE() {
  const { isAuthenticated, role } = useAuthStore();
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'CUSTOMER') return;

    // withCredentials sends the HttpOnly app_token cookie automatically
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`;
    const es = new EventSource(url, { withCredentials: true });
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
  }, [isAuthenticated, role, queryClient]);
}
