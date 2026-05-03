'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { createSseConnection } from '@/lib/realtime/sse-client';

/**
 * Connects ADMIN users to the same /api/realtime/stream and handles
 * admin-specific event types pushed by the backend.
 *
 * Admin event types:
 *   - refund-requested   → invalidate admin refund list
 *   - seller-approved / seller-rejected → invalidate admin seller list
 *   - admin-event        → generic admin action (future use)
 *
 * Note: The main useNotificationsStream handles the base notification events.
 * This hook extends cache invalidation for admin-only keys.
 * Mount both in the admin layout.
 */
export function useAdminEventsStream() {
  const { isAuthenticated, role } = useAuthStore();
  const queryClient = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') return;

    // The main SSE stream at /api/realtime/stream already sends to this user.
    // We add a second listener overlay here via the same connection
    // (EventSource is automatically multiplexed by the browser).
    // Since createSseConnection opens a NEW connection, we only call this once
    // from the admin layout (alongside useNotificationsStream).

    const cleanup = createSseConnection('/realtime/stream', {
      onEvent(eventName, data) {
        switch (eventName) {
          case 'refund-requested': {
            queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
            queryClient.invalidateQueries({ queryKey: ['refunds'] });
            break;
          }
          case 'seller-approved':
          case 'seller-rejected': {
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            break;
          }
          case 'admin-event': {
            // Generic — invalidate commonly-changing admin data
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            break;
          }
          default:
            break;
        }
      },
    });

    cleanupRef.current = cleanup;
    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  }, [isAuthenticated, role, queryClient]);
}
