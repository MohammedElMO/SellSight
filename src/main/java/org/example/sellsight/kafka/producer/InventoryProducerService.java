package org.example.sellsight.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.InventoryUpdatedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Producer service for inventory update events.
 * Emits events to the inventory.updated topic when product stock levels change.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryProducerService {

    private static final String INVENTORY_TOPIC = "inventory.updated";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Publish an inventory update event.
     * Uses product_id as the message key for partitioning by product.
     *
     * @param event the inventory update event
     */
    public void publishInventoryUpdate(InventoryUpdatedEvent event) {
        try {
            String messageKey = event.getProductId().toString();
            String messageValue = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(INVENTORY_TOPIC, messageKey, messageValue).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish inventory event for product_id={}: {}", 
                            event.getProductId(), ex.getMessage(), ex);
                } else {
                    log.debug("Published inventory update for product_id={} to partition={}",
                            event.getProductId(),
                            result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.error("Error serializing inventory update event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish inventory update", e);
        }
    }
}
