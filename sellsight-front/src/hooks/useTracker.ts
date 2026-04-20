'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { eventApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';

// Module-level variables for singleton batching across components
let eventQueue: Record<string, unknown>[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE = 20;
const FLUSH_INTERVAL_MS = 5000;

export async function flushEvents() {
  if (eventQueue.length === 0) return;
  const eventsToSend = [...eventQueue];
  eventQueue = []; // Clear queue immediately
  
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  try {
    await eventApi.track(eventsToSend);
  } catch (error) {
    console.error('Failed to flush tracking events', error);
    // Optionally re-queue failed events
    // eventQueue = [...eventsToSend, ...eventQueue]; 
  }
}

function queueEvent(event: Record<string, unknown>) {
  eventQueue.push({
    ...event,
    timestamp: new Date().toISOString(),
  });

  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL_MS);
  }
}

export function useTracker() {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const trackedPageView = useRef(false);

  // Expose track manual method
  const track = useCallback((eventName: string, payload: Record<string, unknown> = {}) => {
    // We only track CUSTOMER or unauthenticated events to avoid polluting analytics with admin/seller behavior
    if (role && role !== 'CUSTOMER') return;

    queueEvent({
      eventName,
      url: window.location.pathname,
      ...payload,
    });
  }, [role]);

  // Auto-track page views
  useEffect(() => {
    if (!trackedPageView.current) {
      track('PAGE_VIEW');
      trackedPageView.current = true;
    }
  }, [pathname, track]);

  // Handle window unload flush (best effort)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.length > 0) {
        // Use keepalive for reliable delivery on navigation
        const blob = new Blob([JSON.stringify({ events: eventQueue })], { type: 'application/json' });
        navigator.sendBeacon('http://localhost:8080/api/v1/events', blob); 
        eventQueue = [];
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { track };
}
