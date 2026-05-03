package org.example.sellsight.messaging.infrastructure.websocket;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import org.example.sellsight.messaging.application.dto.MessageDto;
import org.example.sellsight.messaging.application.dto.SendMessageRequest;
import org.example.sellsight.messaging.application.usecase.SendMessageUseCase;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * STOMP controller for order-scoped bidirectional messaging.
 *
 * Client sends to:   /app/orders/{orderId}/messages
 * Broadcast goes to: /topic/orders/{orderId}/messages
 *
 * SSE fallback: new-message event pushed to both parties so they receive
 * the message even if their STOMP subscription is temporarily down.
 */
@Controller
public class MessageWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(MessageWebSocketController.class);

    private final SendMessageUseCase sendMessageUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RealtimePublisher realtimePublisher;
    private final Counter wsSentCounter;

    public MessageWebSocketController(SendMessageUseCase sendMessageUseCase,
                                      GetUserProfileUseCase getUserProfileUseCase,
                                      OrderRepository orderRepository,
                                      SimpMessagingTemplate messagingTemplate,
                                      RealtimePublisher realtimePublisher,
                                      MeterRegistry meterRegistry) {
        this.sendMessageUseCase = sendMessageUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.orderRepository = orderRepository;
        this.messagingTemplate = messagingTemplate;
        this.realtimePublisher = realtimePublisher;
        this.wsSentCounter = Counter.builder("realtime.ws.messages.sent")
                .description("Total order messages broadcast via WebSocket")
                .register(meterRegistry);
    }

    @MessageMapping("/orders/{orderId}/messages")
    public void sendMessage(@DestinationVariable String orderId,
                            @Valid @Payload SendMessageRequest request,
                            Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated STOMP SEND to /orders/{}/messages — rejected", orderId);
            return;
        }

        UserDto sender = getUserProfileUseCase.execute(principal.getName());
        MessageDto saved = sendMessageUseCase.execute(orderId, sender.id(), sender.role(), request.body());

        // Broadcast to all STOMP subscribers of this order conversation (instant for connected clients)
        messagingTemplate.convertAndSend("/topic/orders/" + orderId + "/messages", saved);
        wsSentCounter.increment();

        // SSE fallback: push new-message to ALL order participants so they see it
        // even when STOMP subscription is reconnecting
        pushSseFallback(orderId, sender.id(), saved);
    }

    /**
     * Push new-message SSE event to all order participants (customer + sellers),
     * excluding the sender (they already see it via their own STOMP subscription).
     */
    private void pushSseFallback(String orderId, String senderId, MessageDto saved) {
        try {
            Order order = orderRepository.findById(OrderId.from(orderId)).orElse(null);
            if (order == null) return;

            // Collect all participant userIds: customer + each unique seller
            Set<String> participants = order.getItems().stream()
                    .map(item -> item.getSellerId())
                    .collect(Collectors.toSet());
            participants.add(order.getCustomerId());

            // Push to every participant (STOMP handles dedup for connected clients;
            // SSE ensures delivery for temporarily disconnected ones)
            for (String userId : participants) {
                try {
                    realtimePublisher.pushToUser(userId, "new-message", saved);
                } catch (Exception e) {
                    log.debug("SSE new-message push skipped for user={}: {}", userId, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.debug("SSE fallback push skipped for order={}: {}", orderId, e.getMessage());
        }
    }
}
