'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { createSseConnection } from '@/lib/realtime/sse-client';
import type { NotificationDto, MessageDto, OrderDto } from '@shared/types';

/**
 * Connects to /api/realtime/stream and updates React Query caches in response
 * to server-pushed events. Works for all authenticated roles.
 *
 * Event types → cache mutations:
 *   unread-count         → set badge count
 *   notification         → prepend to list + bump badge
 *   new-message          → append to messages cache (SSE fallback when WS reconnecting)
 *   order-status-changed → instant optimistic status update on ['order', id] + ['my-orders']
 *   new-order            → invalidate ['seller-orders']
 *   refund-approved/rejected → invalidate ['order', id] + ['refund', orderId]
 */
export function useNotificationsStream() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = createSseConnection('/realtime/stream', {
      onEvent(eventName, data) {
        switch (eventName) {
          case 'unread-count': {
            const count = Number(data);
            if (!Number.isNaN(count)) {
              queryClient.setQueryData<number>(['unread-count'], count);
            }
            break;
          }

          case 'notification': {
            try {
              const n: NotificationDto = JSON.parse(data);
              queryClient.setQueryData<NotificationDto[]>(
                ['notifications'],
                (old) => (old ? [n, ...old] : [n]),
              );
              queryClient.setQueryData<number>(
                ['unread-count'],
                (old) => (old ?? 0) + 1,
              );
            } catch {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['unread-count'] });
            }
            break;
          }

          case 'new-message': {
            // SSE fallback when STOMP WS subscription is reconnecting
            try {
              const msg: MessageDto = JSON.parse(data);
              queryClient.setQueryData<MessageDto[]>(
                ['messages', msg.orderId],
                (old) => {
                  if (!old) return undefined; // no cache entry yet; let poll create it
                  if (old.some((m) => m.id === msg.id)) return old; // dedup
                  return [...old, msg];
                },
              );
            } catch {
              queryClient.invalidateQueries({ queryKey: ['messages'] });
            }
            break;
          }

          case 'order-status-changed': {
            try {
              const { orderId, status } = JSON.parse(data) as { orderId: string; status: string };

              // 1. Instantly update the single-order cache (order detail page)
              queryClient.setQueryData<OrderDto>(
                ['order', orderId],
                (old) => old ? { ...old, status: status as OrderDto['status'] } : old,
              );

              // 2. Instantly update the matching entry in the orders list
              queryClient.setQueryData<OrderDto[]>(
                ['my-orders'],
                (old) => old
                  ? old.map((o) => o.id === orderId ? { ...o, status: status as OrderDto['status'] } : o)
                  : old,
              );

              // 3. Background refetch to confirm server state (does not flash UI)
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
              queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            } catch {
              // Fallback: blind invalidation if payload is malformed
              queryClient.invalidateQueries({ queryKey: ['order'] });
              queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            }
            break;
          }

          case 'new-order': {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            break;
          }

          case 'refund-approved':
          case 'refund-rejected': {
            try {
              const { orderId } = JSON.parse(data) as { orderId: string };
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
              queryClient.invalidateQueries({ queryKey: ['refund', orderId] });
            } catch {
              queryClient.invalidateQueries({ queryKey: ['order'] });
            }
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
  }, [isAuthenticated, queryClient]);
}
