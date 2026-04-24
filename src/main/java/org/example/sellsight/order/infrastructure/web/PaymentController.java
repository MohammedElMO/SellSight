package org.example.sellsight.order.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.order.application.dto.CreatePaymentIntentRequest;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.dto.PaymentIntentResponse;
import org.example.sellsight.order.application.usecase.CreatePaymentIntentUseCase;
import org.example.sellsight.order.application.usecase.UpdateOrderStatusUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payments", description = "Payment operations mapped via Stripe")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CreatePaymentIntentUseCase createPaymentIntentUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    public PaymentController(CreatePaymentIntentUseCase createPaymentIntentUseCase,
                             UpdateOrderStatusUseCase updateOrderStatusUseCase) {
        this.createPaymentIntentUseCase = createPaymentIntentUseCase;
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
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
    public ResponseEntity<OrderDto> confirmFree(@PathVariable String orderId) {
        return ResponseEntity.ok(updateOrderStatusUseCase.execute(orderId, "CONFIRMED"));
    }
}
