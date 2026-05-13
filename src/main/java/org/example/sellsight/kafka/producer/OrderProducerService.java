package org.example.sellsight.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.OrderCreatedEvent;
import org.example.sellsight.event.OrderFulfilledEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Producer service for order events.
 * Emits events to order.created and order.fulfilled topics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderProducerService {

    private static final String ORDER_CREATED_TOPIC = "order.created";
    private static final String ORDER_FULFILLED_TOPIC = "order.fulfilled";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Publish an order creation event.
     * Uses order_id as the message key for partitioning by order.
     *
     * @param event the order created event
     */
    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            String messageKey = event.getOrderId().toString();
            String messageValue = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(ORDER_CREATED_TOPIC, messageKey, messageValue).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish order created event for order_id={}: {}", 
                            event.getOrderId(), ex.getMessage(), ex);
                } else {
                    log.info("Published order created event for order_id={}, user_id={} to partition={}",
                            event.getOrderId(),
                            event.getUserId(),
                            result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.error("Error serializing order created event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish order created event", e);
        }
    }

    /**
     * Publish an order fulfillment event.
     * Uses order_id as the message key for partitioning by order.
     *
     * @param event the order fulfilled event
     */
    public void publishOrderFulfilled(OrderFulfilledEvent event) {
        try {
            String messageKey = event.getOrderId().toString();
            String messageValue = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(ORDER_FULFILLED_TOPIC, messageKey, messageValue).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish order fulfilled event for order_id={}: {}", 
                            event.getOrderId(), ex.getMessage(), ex);
                } else {
                    log.info("Published order fulfilled event for order_id={}, status={} to partition={}",
                            event.getOrderId(),
                            event.getStatus(),
                            result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.error("Error serializing order fulfilled event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish order fulfilled event", e);
        }
    }
}
