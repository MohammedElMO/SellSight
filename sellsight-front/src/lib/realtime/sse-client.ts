/**
 * Reusable SSE client with exponential-backoff reconnect.
 *
 * Auth: browser sends app_token HttpOnly cookie automatically via withCredentials.
 * Never pass JWTs in query strings.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export type SseEventHandlers = {
  onEvent?: (eventName: string, data: string) => void;
  onOpen?: () => void;
  onError?: (err: Event) => void;
};

export function createSseConnection(
  path: string,
  handlers: SseEventHandlers,
): () => void {
  let es: EventSource | null = null;
  let retryCount = 0;
  let destroyed = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (destroyed) return;

    const url = `${BASE_URL}${path}`;
    es = new EventSource(url, { withCredentials: true });

    es.onopen = () => {
      retryCount = 0;
      handlers.onOpen?.();
    };

    // Default message (no event name)
    es.onmessage = (e) => handlers.onEvent?.('message', e.data);

    es.onerror = (err) => {
      handlers.onError?.(err);
      es?.close();
      es = null;

      if (!destroyed) {
        // Exponential backoff: 1s, 2s, 4s, 8s … max 30s
        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        retryCount++;
        retryTimer = setTimeout(connect, delay);
      }
    };
  }

  connect();

  // Return cleanup function
  return () => {
    destroyed = true;
    if (retryTimer) clearTimeout(retryTimer);
    es?.close();
    es = null;
  };
}

/**
 * Wire a named-event listener onto an existing EventSource.
 * Returns an unsubscribe function.
 */
export function addSseListener(
  es: EventSource,
  eventName: string,
  handler: (data: string) => void,
): () => void {
  const listener = (e: MessageEvent) => handler(e.data);
  es.addEventListener(eventName, listener);
  return () => es.removeEventListener(eventName, listener);
}
