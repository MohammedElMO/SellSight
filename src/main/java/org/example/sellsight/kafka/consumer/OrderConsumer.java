package org.example.sellsight.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.OrderCreatedEvent;
import org.example.sellsight.event.OrderFulfilledEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Consumer service for order events.
 * Listens to order.created and order.fulfilled topics.
 * 
 * Responsibilities:
 * - Send order confirmation emails
 * - Update order status in cache
 * - Trigger shipment workflows
 * - Record analytics events for business intelligence
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderConsumer {

    private final ObjectMapper objectMapper;
    // TODO: Inject services for email, notifications, workflow, analytics

    /**
     * Process order creation events.
     * Called when a new order is created.
     */
    @KafkaListener(
            topics = "order.created",
            groupId = "sellsight-order-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void processOrderCreated(
            @Payload String payload,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            OrderCreatedEvent event = objectMapper.readValue(payload, OrderCreatedEvent.class);
            
            log.info("Processing order created: order_id={}, user_id={}, total_amount={}, offset={}",
                    event.getOrderId(), event.getUserId(), event.getTotalAmount(), offset);

            // Send order confirmation email to customer
            sendOrderConfirmationEmail(event);

            // Update order cache
            updateOrderCache(event);

            // Trigger inventory decrement (via another event or direct call)
            triggerInventoryDecrement(event);

            log.debug("Successfully processed order created event for order_id={}", event.getOrderId());

        } catch (Exception e) {
            log.error("Error processing order created event: {}", e.getMessage(), e);
            // TODO: Send to dead-letter topic
        }
    }

    /**
     * Process order fulfillment/status-change events.
     * Called when order status changes (shipped, delivered, cancelled, refunded).
     */
    @KafkaListener(
            topics = "order.fulfilled",
            groupId = "sellsight-order-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void processOrderFulfilled(
            @Payload String payload,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            OrderFulfilledEvent event = objectMapper.readValue(payload, OrderFulfilledEvent.class);
            
            log.info("Processing order fulfilled: order_id={}, status={}, offset={}",
                    event.getOrderId(), event.getStatus(), offset);

            switch (event.getStatus()) {
                case "SHIPPED":
                    handleOrderShipped(event);
                    break;
                case "DELIVERED":
                    handleOrderDelivered(event);
                    break;
                case "CANCELLED":
                    handleOrderCancelled(event);
                    break;
                case "REFUNDED":
                    handleOrderRefunded(event);
                    break;
                default:
                    log.warn("Unknown order status: {}", event.getStatus());
            }

            // Update order cache
            updateOrderStatus(event);

            log.debug("Successfully processed order fulfilled event for order_id={}", event.getOrderId());

        } catch (Exception e) {
            log.error("Error processing order fulfilled event: {}", e.getMessage(), e);
            // TODO: Send to dead-letter topic
        }
    }

    /**
     * Send order confirmation email to customer.
     */
    private void sendOrderConfirmationEmail(OrderCreatedEvent event) {
        log.info("Sending order confirmation email to user_id={} for order_id={}",
                event.getUserId(), event.getOrderId());
        
        // TODO: Call email service to send confirmation email
        // Include order items, total price, tracking link, etc.
    }

    /**
     * Update order cache with latest order info.
     */
    private void updateOrderCache(OrderCreatedEvent event) {
        log.debug("Updated cache for order_id={}: status=PENDING", event.getOrderId());
        // TODO: Cache in Redis for fast lookups
    }

    /**
     * Trigger inventory decrement when order is placed.
     */
    private void triggerInventoryDecrement(OrderCreatedEvent event) {
        log.debug("Triggering inventory decrement for order_id={}", event.getOrderId());
        // TODO: Decrement product quantities in inventory table
        // Option A: Call inventory service synchronously
        // Option B: Publish a separate event (Saga pattern)
    }

    /**
     * Handle order shipped status.
     */
    private void handleOrderShipped(OrderFulfilledEvent event) {
        log.info("Order shipped: order_id={}, tracking={}", event.getOrderId(), event.getTrackingNumber());
        // TODO: Send shipping notification email with tracking number
        // TODO: Update customer dashboard
    }

    /**
     * Handle order delivered status.
     */
    private void handleOrderDelivered(OrderFulfilledEvent event) {
        log.info("Order delivered: order_id={}", event.getOrderId());
        // TODO: Send delivery confirmation email
        // TODO: Request product review
        // TODO: Update seller rating/performance metrics
    }

    /**
     * Handle order cancelled status.
     */
    private void handleOrderCancelled(OrderFulfilledEvent event) {
        log.info("Order cancelled: order_id={}, reason={}", event.getOrderId(), event.getReason());
        // TODO: Send cancellation email
        // TODO: Restore inventory
        // TODO: Process refund if payment was taken
    }

    /**
     * Handle order refunded status.
     */
    private void handleOrderRefunded(OrderFulfilledEvent event) {
        log.info("Order refunded: order_id={}, reason={}", event.getOrderId(), event.getReason());
        // TODO: Send refund confirmation email
        // TODO: Restore inventory if not already done
        // TODO: Update payment/refund records
    }

    /**
     * Update order status in cache.
     */
    private void updateOrderStatus(OrderFulfilledEvent event) {
        log.debug("Updated cache for order_id={}: status={}", event.getOrderId(), event.getStatus());
        // TODO: Update Redis cache with latest status
    }
}
