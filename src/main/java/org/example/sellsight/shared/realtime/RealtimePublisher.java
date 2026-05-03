package org.example.sellsight.shared.realtime;

/**
 * Port: push realtime events to connected clients.
 * Implemented by SseRealtimePublisher in the realtime infrastructure layer.
 */
public interface RealtimePublisher {

    /** Push a named SSE event carrying a JSON-serialisable payload to one user. */
    void pushToUser(String userId, String eventName, Object payload);

    /** Push to every currently connected admin SSE stream. */
    void pushToAdmins(String eventName, Object payload);
}
