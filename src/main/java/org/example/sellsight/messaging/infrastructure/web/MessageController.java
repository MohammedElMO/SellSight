package org.example.sellsight.messaging.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.messaging.application.dto.MessageDto;
import org.example.sellsight.messaging.application.dto.SendMessageRequest;
import org.example.sellsight.messaging.application.usecase.GetMessagesUseCase;
import org.example.sellsight.messaging.application.usecase.SendMessageUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Messaging", description = "Order-scoped messages between customers and sellers")
@RestController
@RequestMapping("/api/orders/{orderId}/messages")
public class MessageController {

    private final SendMessageUseCase sendMessageUseCase;
    private final GetMessagesUseCase getMessagesUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public MessageController(SendMessageUseCase sendMessageUseCase,
                             GetMessagesUseCase getMessagesUseCase,
                             GetUserProfileUseCase getUserProfileUseCase) {
        this.sendMessageUseCase   = sendMessageUseCase;
        this.getMessagesUseCase   = getMessagesUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
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
        String role  = user.role();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sendMessageUseCase.execute(orderId, user.id(), role, request.body()));
    }
}
