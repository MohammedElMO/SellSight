package org.example.sellsight.realtime.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class SseRealtimePublisher implements RealtimePublisher {

    private static final Logger log = LoggerFactory.getLogger(SseRealtimePublisher.class);

    private final SseEmitterRegistry registry;
    private final ObjectMapper objectMapper;
    private final Counter pushCounter;
    private final Counter failCounter;

    public SseRealtimePublisher(SseEmitterRegistry registry,
                                ObjectMapper objectMapper,
                                MeterRegistry meterRegistry) {
        this.registry = registry;
        this.objectMapper = objectMapper;
        this.pushCounter = Counter.builder("realtime.sse.events.pushed")
                .description("Total SSE events pushed to clients")
                .register(meterRegistry);
        this.failCounter = Counter.builder("realtime.sse.push.failures")
                .description("SSE push failures (no connected client or serialization error)")
                .register(meterRegistry);
    }

    @Override
    public void pushToUser(String userId, String eventName, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            registry.sendToUser(userId, SseEmitter.event().name(eventName).data(json));
            pushCounter.increment();
        } catch (Exception e) {
            failCounter.increment();
            log.debug("SSE push failed for user={} event={}: {}", userId, eventName, e.getMessage());
        }
    }

    @Override
    public void pushToAdmins(String eventName, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            registry.sendToRole("ADMIN", SseEmitter.event().name(eventName).data(json));
            pushCounter.increment();
        } catch (Exception e) {
            failCounter.increment();
            log.debug("SSE admin push failed event={}: {}", eventName, e.getMessage());
        }
    }
}
