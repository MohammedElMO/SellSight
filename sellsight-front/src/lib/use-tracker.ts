/**
 * Behavioral event tracking hook — batches events and fires them to Kafka
 * via the /api/v1/events endpoint on flush or when the batch size threshold is reached.
 */

import { useCallback, useRef } from 'react';
import { eventApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import type { EventType } from '@shared/types';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;

export function useTracker() {
  const queue = useRef<Record<string, unknown>[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getEmail = useAuthStore((s) => s.email);

  const flush = useCallback(() => {
    if (queue.current.length === 0) return;
    const batch = [...queue.current];
    queue.current = [];
    eventApi.track(batch).catch(() => {
      // fire-and-forget — swallow errors
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      flush();
      timer.current = null;
    }, FLUSH_INTERVAL_MS);
  }, [flush]);

  const track = useCallback(
    (eventType: EventType, metadata?: Record<string, string>, productId?: string) => {
      queue.current.push({
        eventType,
        userId: getEmail || 'anonymous',
        productId,
        metadata,
        timestamp: new Date().toISOString(),
      });

      if (queue.current.length >= BATCH_SIZE) {
        flush();
      } else {
        scheduleFlush();
      }
    },
    [getEmail, flush, scheduleFlush],
  );

  return { track, flush };
}
