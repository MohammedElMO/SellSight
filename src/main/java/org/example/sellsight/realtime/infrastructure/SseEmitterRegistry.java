package org.example.sellsight.realtime.infrastructure;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Thread-safe registry of live SSE emitters, keyed by userId.
 * Max 5 connections per user; oldest is dropped on overflow.
 */
@Component
public class SseEmitterRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterRegistry.class);
    private static final int MAX_PER_USER = 5;

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> byUser = new ConcurrentHashMap<>();
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> byRole = new ConcurrentHashMap<>();

    public SseEmitterRegistry(MeterRegistry meterRegistry) {
        Gauge.builder("realtime.sse.connections.active", byUser,
                        m -> m.values().stream().mapToInt(List::size).sum())
                .description("Active SSE connections")
                .register(meterRegistry);
    }

    /**
     * Register a new emitter for the given user + role.
     * Returns the emitter with cleanup callbacks wired.
     */
    public SseEmitter register(String userId, String role) {
        CopyOnWriteArrayList<SseEmitter> userList =
                byUser.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());

        // Evict oldest when at capacity
        if (userList.size() >= MAX_PER_USER) {
            SseEmitter oldest = userList.get(0);
            userList.remove(oldest);
            try { oldest.complete(); } catch (Exception ignored) {}
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        userList.add(emitter);

        // Role-bucket for admin broadcasts
        if (role != null) {
            byRole.computeIfAbsent(role, k -> new CopyOnWriteArrayList<>()).add(emitter);
        }

        Runnable cleanup = () -> {
            userList.remove(emitter);
            if (userList.isEmpty()) byUser.remove(userId, userList);
            if (role != null) {
                CopyOnWriteArrayList<SseEmitter> roleList = byRole.get(role);
                if (roleList != null) {
                    roleList.remove(emitter);
                    if (roleList.isEmpty()) byRole.remove(role, roleList);
                }
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        return emitter;
    }

    /** Push an event to all emitters belonging to userId. Dead emitters are removed. */
    public void sendToUser(String userId, SseEmitter.SseEventBuilder event) {
        List<SseEmitter> list = byUser.getOrDefault(userId, new CopyOnWriteArrayList<>());
        List<SseEmitter> dead = new ArrayList<>();

        for (SseEmitter emitter : list) {
            try {
                emitter.send(event);
            } catch (IOException e) {
                dead.add(emitter);
            }
        }

        dead.forEach(e -> {
            list.remove(e);
            log.debug("Removed dead SSE emitter for user {}", userId);
        });
    }

    /** Push an event to every emitter registered under the given role. */
    public void sendToRole(String role, SseEmitter.SseEventBuilder event) {
        List<SseEmitter> list = byRole.getOrDefault(role, new CopyOnWriteArrayList<>());
        List<SseEmitter> dead = new ArrayList<>();

        for (SseEmitter emitter : list) {
            try {
                emitter.send(event);
            } catch (IOException e) {
                dead.add(emitter);
            }
        }

        dead.forEach(e -> list.remove(e));
    }

    /** Send a heartbeat comment to every connected emitter to keep proxies from closing idle connections. */
    public void heartbeatAll() {
        SseEmitter.SseEventBuilder ping = SseEmitter.event().comment("ping");
        byUser.keySet().forEach(userId -> sendToUser(userId, ping));
    }

    public int totalConnections() {
        return byUser.values().stream().mapToInt(List::size).sum();
    }
}
