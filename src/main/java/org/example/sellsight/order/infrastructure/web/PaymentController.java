package org.example.sellsight.order.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.CreatePaymentIntentRequest;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.dto.PaymentIntentResponse;
import org.example.sellsight.order.application.usecase.CreatePaymentIntentUseCase;
import org.example.sellsight.order.application.usecase.SendOrderReceiptEmailUseCase;
import org.example.sellsight.order.application.usecase.UpdateOrderStatusUseCase;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payments", description = "Payment operations mapped via Stripe")
@Slf4j
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CreatePaymentIntentUseCase createPaymentIntentUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final SendOrderReceiptEmailUseCase sendOrderReceiptEmailUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public PaymentController(CreatePaymentIntentUseCase createPaymentIntentUseCase,
                             UpdateOrderStatusUseCase updateOrderStatusUseCase,
                             SendOrderReceiptEmailUseCase sendOrderReceiptEmailUseCase,
                             GetUserProfileUseCase getUserProfileUseCase) {
        this.createPaymentIntentUseCase = createPaymentIntentUseCase;
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
        this.sendOrderReceiptEmailUseCase = sendOrderReceiptEmailUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    private String resolveUserId(Authentication auth) {
        return getUserProfileUseCase.execute(auth.getName()).id();
    }

    @Operation(summary = "Create Stripe payment intent", description = "Generates a Stripe client secret", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentIntentResponse> createIntent(@Valid @RequestBody CreatePaymentIntentRequest request) {
        return ResponseEntity.ok(createPaymentIntentUseCase.execute(request.amount(), request.orderId()));
    }

    @Operation(summary = "Confirm a free order", description = "Confirms an order with zero total (100% discount applied). No payment required.", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/confirm-free/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> confirmFree(@PathVariable String orderId, Authentication auth) {
        String userId = resolveUserId(auth);
        OrderDto order = updateOrderStatusUseCase.execute(orderId, "CONFIRMED", userId, "CUSTOMER");
        try {
            sendOrderReceiptEmailUseCase.send(order, "free-order", 0L, 0L);
        } catch (Exception e) {
            log.warn("Receipt email skipped for free order {}: {}", orderId, e.getMessage());
        }
        return ResponseEntity.ok(order);
    }

    @Operation(summary = "Confirm a paid order after Stripe payment", description = "Called by the frontend after Stripe confirms payment client-side. Transitions order to CONFIRMED and awards loyalty points.", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/confirm/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> confirmPaid(@PathVariable String orderId, Authentication auth) {
        String userId = resolveUserId(auth);
        OrderDto order = updateOrderStatusUseCase.execute(orderId, "CONFIRMED", userId, "CUSTOMER");
        try {
            sendOrderReceiptEmailUseCase.send(order, "paid-order", 0L, 0L);
        } catch (Exception e) {
            log.warn("Receipt email skipped for order {}: {}", orderId, e.getMessage());
        }
        return ResponseEntity.ok(order);
    }
}
