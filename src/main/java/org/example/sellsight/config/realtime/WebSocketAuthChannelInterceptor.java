package org.example.sellsight.config.realtime;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Validates authentication on every inbound STOMP frame.
 *
 * Authentication is performed during the HTTP upgrade handshake by
 * JwtAuthenticationFilter (reads app_token cookie). Spring WebSocket
 * propagates the resulting Principal to the STOMP session.
 * This interceptor enforces that no unauthenticated CONNECT is accepted
 * and tracks active WebSocket session metrics.
 */
@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final AtomicInteger activeSessions = new AtomicInteger();
    private final Counter messageCounter;

    public WebSocketAuthChannelInterceptor(MeterRegistry meterRegistry) {
        Gauge.builder("realtime.ws.sessions.active", activeSessions, AtomicInteger::get)
                .description("Active WebSocket/STOMP sessions")
                .register(meterRegistry);
        this.messageCounter = Counter.builder("realtime.ws.messages.received")
                .description("Total STOMP messages received from clients")
                .register(meterRegistry);
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();
        if (command == null) return message;

        switch (command) {
            case CONNECT -> {
                Principal user = accessor.getUser();
                if (user == null) {
                    throw new AccessDeniedException("WebSocket connection requires authentication. " +
                            "Ensure app_token cookie is present on the upgrade request.");
                }
                activeSessions.incrementAndGet();
            }
            case DISCONNECT -> activeSessions.decrementAndGet();
            case SEND -> messageCounter.increment();
            default -> { /* no-op */ }
        }

        return message;
    }
}
