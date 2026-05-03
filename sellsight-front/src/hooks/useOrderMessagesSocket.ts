'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { createStompClient } from '@/lib/realtime/ws-client';
import type { Client } from '@stomp/stompjs';
import type { MessageDto } from '@shared/types';

/**
 * Subscribes to the STOMP topic for an order's message conversation.
 *
 * When a new message arrives via WebSocket it is appended to the
 * React Query cache for ['order-messages', orderId] immediately,
 * so the UI updates without waiting for a re-fetch.
 *
 * HTTP GET /api/orders/{orderId}/messages remains the source of truth
 * for initial load and history.
 *
 * @param orderId  The order UUID to subscribe to. Pass null/undefined to skip.
 */
export function useOrderMessagesSocket(orderId: string | null | undefined) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);

  const appendMessage = useCallback(
    (msg: MessageDto) => {
      // Query key must match useOrderMessages → ['messages', orderId]
      queryClient.setQueryData<MessageDto[]>(
        ['messages', orderId],
        (old) => {
          if (!old) return [msg];
          // Deduplicate by id in case HTTP poll and WS race
          if (old.some((m) => m.id === msg.id)) return old;
          return [...old, msg];
        },
      );
    },
    [queryClient, orderId],
  );

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;

    const client = createStompClient();

    client.onConnect = () => {
      client.subscribe(`/topic/orders/${orderId}/messages`, (frame) => {
        try {
          const msg: MessageDto = JSON.parse(frame.body);
          appendMessage(msg);
        } catch {
          // Malformed frame — invalidate and let HTTP poll catch up
          queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
        }
      });
    };

    client.onDisconnect = () => {
      // React Query's polling (fallback) will keep data fresh
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated, orderId, appendMessage, queryClient]);

  /** Send a message via STOMP (bypasses HTTP for lower latency). */
  const sendViaSocket = useCallback(
    (body: string): boolean => {
      const client = clientRef.current;
      if (!client?.connected || !orderId) return false;
      client.publish({
        destination: `/app/orders/${orderId}/messages`,
        body: JSON.stringify({ body }),
      });
      return true;
    },
    [orderId],
  );

  return { sendViaSocket };
}
