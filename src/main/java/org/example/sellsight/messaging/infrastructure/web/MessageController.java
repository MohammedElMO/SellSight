package org.example.sellsight.messaging.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.messaging.application.dto.MessageDto;
import org.example.sellsight.messaging.application.dto.SendMessageRequest;
import org.example.sellsight.messaging.application.usecase.GetMessagesUseCase;
import org.example.sellsight.messaging.application.usecase.SendMessageUseCase;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Tag(name = "Messaging", description = "Order-scoped messages between customers and sellers")
@RestController
@RequestMapping("/api/orders/{orderId}/messages")
public class MessageController {

    private static final Logger log = LoggerFactory.getLogger(MessageController.class);

    private final SendMessageUseCase sendMessageUseCase;
    private final GetMessagesUseCase getMessagesUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;
    private final OrderRepository orderRepository;
    private final RealtimePublisher realtimePublisher;

    public MessageController(SendMessageUseCase sendMessageUseCase,
                             GetMessagesUseCase getMessagesUseCase,
                             GetUserProfileUseCase getUserProfileUseCase,
                             OrderRepository orderRepository,
                             RealtimePublisher realtimePublisher) {
        this.sendMessageUseCase = sendMessageUseCase;
        this.getMessagesUseCase = getMessagesUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.orderRepository = orderRepository;
        this.realtimePublisher = realtimePublisher;
    }

    @Operation(operationId = "getOrderMessages", summary = "Get messages for an order",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SELLER', 'ADMIN')")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable String orderId) {
        return ResponseEntity.ok(getMessagesUseCase.execute(orderId));
    }

    @Operation(operationId = "sendOrderMessage", summary = "Send a message on an order",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SELLER', 'ADMIN')")
    public ResponseEntity<MessageDto> send(
            @PathVariable String orderId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {
        UserDto user = getUserProfileUseCase.execute(authentication.getName());
        MessageDto saved = sendMessageUseCase.execute(orderId, user.id(), user.role(), request.body());

        // Push new-message SSE to all participants so they see it without waiting for polling
        pushSseToParticipants(orderId, saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private void pushSseToParticipants(String orderId, MessageDto saved) {
        try {
            Order order = orderRepository.findById(OrderId.from(orderId)).orElse(null);
            if (order == null) return;

            Set<String> participants = order.getItems().stream()
                    .map(item -> item.getSellerId())
                    .collect(Collectors.toSet());
            participants.add(order.getCustomerId());

            for (String userId : participants) {
                try {
                    realtimePublisher.pushToUser(userId, "new-message", saved);
                } catch (Exception e) {
                    log.debug("SSE new-message push skipped for user={}: {}", userId, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.debug("SSE push skipped for HTTP message on order={}: {}", orderId, e.getMessage());
        }
    }
}
