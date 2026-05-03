package org.example.sellsight.realtime.infrastructure;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Sends a keepalive comment to all SSE connections every 25 seconds. */
@Component
public class SseHeartbeatTask {

    private final SseEmitterRegistry registry;

    public SseHeartbeatTask(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @Scheduled(fixedDelay = 25_000)
    public void heartbeat() {
        registry.heartbeatAll();
    }
}
