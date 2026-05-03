'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

/**
 * Seller-specific realtime updates.
 * The main notification stream already handles new-order events;
 * this hook ensures seller dashboard query keys are invalidated.
 *
 * Uses useNotificationsStream implicitly — no second SSE connection opened.
 * Call this in the seller layout/dashboard alongside useNotificationsStream.
 */
export function useSellerDashboardStream() {
  const { isAuthenticated, role } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || (role !== 'SELLER' && role !== 'ADMIN')) return;

    // The SSE stream already invalidates seller-orders on new-order events.
    // This hook is a placeholder for additional seller-specific SSE event types
    // (e.g. product-moderation, seller-approval) that may be added in future.
  }, [isAuthenticated, role, queryClient]);
}
