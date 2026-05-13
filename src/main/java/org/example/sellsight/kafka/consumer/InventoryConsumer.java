package org.example.sellsight.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.InventoryUpdatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Consumer service for inventory update events.
 * Listens to the inventory.updated topic.
 * 
 * Responsibilities:
 * - Detect low-stock scenarios and trigger alerts
 * - Update cache with latest inventory levels
 * - Trigger reorder notifications
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryConsumer {

    private final ObjectMapper objectMapper;
    // TODO: Inject services for cache updates, notifications, etc.

    /**
     * Process inventory update events.
     * Called when a message arrives on the inventory.updated topic.
     * 
     * @param payload the JSON event payload
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "inventory.updated",
            groupId = "sellsight-inventory-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void processInventoryUpdate(
            @Payload String payload,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            InventoryUpdatedEvent event = objectMapper.readValue(payload, InventoryUpdatedEvent.class);
            
            log.info("Processing inventory update: product_id={}, quantity={}, offset={}",
                    event.getProductId(), event.getQuantity(), offset);

            // Check if stock has fallen below reorder threshold
            if (event.getQuantity() <= event.getReorderThreshold()) {
                handleLowStock(event);
            }

            // Update cache with latest inventory
            updateInventoryCache(event);

            log.debug("Successfully processed inventory update for product_id={}", event.getProductId());

        } catch (Exception e) {
            log.error("Error processing inventory update event: {}", e.getMessage(), e);
            // In production, send to dead-letter topic or alert
        }
    }

    /**
     * Handle low-stock scenario: trigger alerts and notifications.
     */
    private void handleLowStock(InventoryUpdatedEvent event) {
        log.warn("LOW STOCK ALERT: product_id={}, quantity={}, threshold={}",
                event.getProductId(), event.getQuantity(), event.getReorderThreshold());
        
        // TODO: Trigger low-stock alert notification
        // TODO: Notify seller to reorder
        // TODO: Possibly update product visibility (mark as limited stock)
    }

    /**
     * Update cache with latest inventory levels.
     */
    private void updateInventoryCache(InventoryUpdatedEvent event) {
        // TODO: Update Redis cache with latest inventory
        // TODO: This enables fast lookups without hitting DB
        log.debug("Updated cache for product_id={}: quantity={}",
                event.getProductId(), event.getQuantity());
    }
}
