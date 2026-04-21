package org.example.sellsight.order.infrastructure.web;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.usecase.SendNotificationUseCase;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.loyalty.application.usecase.GetLoyaltyAccountUseCase;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.usecase.UpdateOrderStatusUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Tag(name = "Payments", description = "Payment operations mapped via Stripe")
@RestController
@RequestMapping("/api/payments")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final InventoryRepository inventoryRepository;
    private final GetLoyaltyAccountUseCase getLoyaltyAccountUseCase;
    private final SendNotificationUseCase sendNotificationUseCase;

    public StripeWebhookController(UpdateOrderStatusUseCase updateOrderStatusUseCase,
                                    InventoryRepository inventoryRepository,
                                    GetLoyaltyAccountUseCase getLoyaltyAccountUseCase,
                                    SendNotificationUseCase sendNotificationUseCase) {
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
        this.inventoryRepository = inventoryRepository;
        this.getLoyaltyAccountUseCase = getLoyaltyAccountUseCase;
        this.sendNotificationUseCase = sendNotificationUseCase;
    }

    @Operation(summary = "Stripe webhook receiver", description = "Handles payment_intent.succeeded and payment_intent.payment_failed events")
    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        log.info("Stripe webhook received: type={}, id={}", event.getType(), event.getId());

        try {
            switch (event.getType()) {
                case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
                case "payment_intent.payment_failed" -> handlePaymentFailed(event);
                default -> log.debug("Unhandled Stripe event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Unhandled error processing Stripe event {}: {}", event.getId(), e.getMessage(), e);
        }

        return ResponseEntity.ok("received");
    }

    private void handlePaymentSucceeded(Event event) {
        Optional<StripeObject> obj = event.getDataObjectDeserializer().getObject();
        if (obj.isEmpty()) {
            log.error("payment_intent.succeeded: could not deserialize PaymentIntent from event {}", event.getId());
            return;
        }
        PaymentIntent intent = (PaymentIntent) obj.get();
        String orderId = intent.getMetadata().get("order_id");

        if (orderId == null || orderId.isBlank()) {
            log.error("payment_intent.succeeded: no order_id in metadata for PI {}", intent.getId());
            return;
        }

        log.info("Fulfilling order {} after payment_intent.succeeded (PI={})", orderId, intent.getId());

        try {
            OrderDto order = updateOrderStatusUseCase.execute(orderId, "CONFIRMED");

            for (var item : order.items()) {
                try {
                    inventoryRepository.findByProductId(item.productId()).ifPresent(inv -> {
                        inv.decreaseStock(item.quantity());
                        inventoryRepository.save(inv);
                    });
                } catch (Exception e) {
                    log.warn("Inventory decrement skipped for product {} on order {}: {}",
                            item.productId(), orderId, e.getMessage());
                }
            }

            try {
                getLoyaltyAccountUseCase.earnPoints(order.customerId(), order.total(), orderId);
            } catch (Exception e) {
                log.warn("Loyalty point award skipped for order {}: {}", orderId, e.getMessage());
            }

            try {
                String shortId = orderId.substring(0, 8).toUpperCase();
                sendNotificationUseCase.send(
                        order.customerId(),
                        "ORDER_CONFIRMED",
                        "Order Confirmed",
                        "Your order #" + shortId + " has been placed successfully. Total: $" + order.total()
                );
            } catch (Exception e) {
                log.warn("Order confirmation notification skipped for order {}: {}", orderId, e.getMessage());
            }

        } catch (Exception e) {
            log.error("Failed to fulfill order {} from webhook: {}", orderId, e.getMessage(), e);
        }
    }

    private void handlePaymentFailed(Event event) {
        Optional<StripeObject> obj = event.getDataObjectDeserializer().getObject();
        if (obj.isEmpty()) {
            log.error("payment_intent.payment_failed: could not deserialize PaymentIntent from event {}", event.getId());
            return;
        }
        PaymentIntent intent = (PaymentIntent) obj.get();
        String orderId = intent.getMetadata().get("order_id");
        String errorMsg = intent.getLastPaymentError() != null
                ? intent.getLastPaymentError().getMessage()
                : "unknown";

        log.warn("payment_intent.payment_failed: PI={}, order_id={}, error={}",
                intent.getId(), orderId, errorMsg);

        if (orderId != null && !orderId.isBlank()) {
            try {
                updateOrderStatusUseCase.execute(orderId, "CANCELLED");
                log.info("Order {} cancelled due to payment failure", orderId);
            } catch (Exception e) {
                log.warn("Failed to cancel order {} after payment failure: {}", orderId, e.getMessage());
            }
        }
    }
}
