'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { createSseConnection } from '@/lib/realtime/sse-client';
import { toast } from 'sonner';
import type { NotificationDto, MessageDto, OrderDto } from '@shared/types';

const SSE_EVENTS = [
  'unread-count',
  'notification',
  'new-message',
  'order-status-changed',
  'order-placed',
  'new-order',
  'refund-approved',
  'refund-rejected',
  'loyalty-updated',
] as const;

/**
 * Connects to /api/realtime/stream and updates React Query caches in response
 * to server-pushed events. Works for all authenticated roles.
 *
 * Event types → cache mutations:
 *   unread-count         → set badge count
 *   notification         → prepend to list + bump badge
 *   new-message          → append to messages cache (SSE fallback when WS reconnecting)
 *   order-status-changed → instant status update on ['order', id] + ['my-orders']
 *   new-order            → invalidate ['seller-orders']
 *   refund-approved/rejected → invalidate ['order', id] + ['refund', orderId]
 */
export function useNotificationsStream() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = createSseConnection(
      '/realtime/stream',
      {
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
              try {
                const msg: MessageDto = JSON.parse(data);
                queryClient.setQueryData<MessageDto[]>(
                  ['messages', msg.orderId],
                  (old) => {
                    if (!old) return undefined;
                    if (old.some((m) => m.id === msg.id)) return old;
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
                // Optimistically update in-memory cache
                queryClient.setQueryData<OrderDto>(
                  ['order', orderId],
                  (old) => old ? { ...old, status: status as OrderDto['status'] } : old,
                );
                queryClient.setQueryData<OrderDto[]>(
                  ['my-orders'],
                  (old) =>
                    old
                      ? old.map((o) => o.id === orderId ? { ...o, status: status as OrderDto['status'] } : o)
                      : old,
                );
                // Force refetch to confirm server state
                queryClient.refetchQueries({ queryKey: ['order', orderId] });
                queryClient.refetchQueries({ queryKey: ['my-orders'] });
                queryClient.refetchQueries({ queryKey: ['seller-orders'] });
                queryClient.refetchQueries({ queryKey: ['all-orders'] });
              } catch {
                queryClient.refetchQueries({ queryKey: ['order'] });
                queryClient.refetchQueries({ queryKey: ['my-orders'] });
              }
              break;
            }

            case 'order-placed': {
              try {
                const { orderId } = JSON.parse(data) as { orderId: string; status: string };
                // Force immediate refetch — staleTime would otherwise suppress a re-fetch
                queryClient.refetchQueries({ queryKey: ['my-orders'] });
                queryClient.refetchQueries({ queryKey: ['order', orderId] });
                toast.success('Your order has been placed!', {
                  duration: 5000,
                  id: `order-placed-${orderId}`,
                });
              } catch {
                queryClient.refetchQueries({ queryKey: ['my-orders'] });
              }
              break;
            }

            case 'new-order': {
              // Force immediate refetch on seller orders list AND admin all-orders
              queryClient.refetchQueries({ queryKey: ['seller-orders'] });
              queryClient.refetchQueries({ queryKey: ['all-orders'] });
              // Show a toast so the seller/admin is visually alerted
              try {
                const { orderId, total } = JSON.parse(data) as { orderId: string; total: number };
                toast.success(
                  `New order received! #${String(orderId).slice(-6).toUpperCase()} — $${Number(total).toFixed(2)}`,
                  { duration: 6000, id: `new-order-${orderId}` },
                );
              } catch {
                toast.success('New order received!', { duration: 5000 });
              }
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

            case 'loyalty-updated': {
              queryClient.invalidateQueries({ queryKey: ['loyalty'] });
              break;
            }

            default:
              break;
          }
        },
      },
      [...SSE_EVENTS],
    );

    cleanupRef.current = cleanup;
    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  }, [isAuthenticated, queryClient]);
}
