/**
 * STOMP/WebSocket client wrapper.
 *
 * Auth: browser sends app_token HttpOnly cookie automatically during
 * the WebSocket upgrade handshake — no manual token handling needed.
 *
 * Usage:
 *   const client = createStompClient();
 *   client.onConnect = () => {
 *     client.subscribe('/topic/orders/abc/messages', (msg) => { ... });
 *   };
 *   client.activate();
 *   // cleanup:
 *   client.deactivate();
 */

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

const WS_URL = (() => {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';
  // Convert http(s):// → ws(s)://  and strip /api suffix if present
  return api.replace(/^http/, 'ws').replace(/\/api$/, '') + '/ws';
})();

export function createStompClient(): Client {
  return new Client({
    brokerURL: WS_URL,
    // withCredentials equivalent: STOMP over native WS sends cookies automatically
    // because it uses the same-origin WebSocket — no extra config needed
    reconnectDelay: 5_000,
    heartbeatIncoming: 25_000,
    heartbeatOutgoing: 25_000,
  });
}

export type { IMessage, StompSubscription };
