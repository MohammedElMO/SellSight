package org.example.sellsight.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.InventoryUpdatedEvent;
import org.example.sellsight.event.OrderCreatedEvent;
import org.example.sellsight.event.UserActivityEvent;
import org.example.sellsight.kafka.producer.InventoryProducerService;
import org.example.sellsight.kafka.producer.OrderProducerService;
import org.example.sellsight.kafka.producer.UserActivityProducerService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Development configuration for testing Kafka producers.
 * Enabled only with 'kafka-test' profile.
 * Usage: ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=kafka-test"
 */
@Configuration
@Profile("kafka-test")
@Slf4j
public class KafkaTestConfig {

    @Bean
    public CommandLineRunner kafkaTestRunner(
            InventoryProducerService inventoryProducer,
            OrderProducerService orderProducer,
            UserActivityProducerService activityProducer) {
        
        return args -> {
            log.info("========== KAFKA PRODUCER TEST ==========");
            
            try {
                // Test 1: Publish inventory update event
                publishInventoryTestEvent(inventoryProducer);
                Thread.sleep(500);
                
                // Test 2: Publish order created event
                publishOrderTestEvent(orderProducer);
                Thread.sleep(500);
                
                // Test 3: Publish user activity events
                publishActivityTestEvents(activityProducer);
                
                log.info("========== ALL TEST EVENTS PUBLISHED ==========");
                log.info("Check logs for consumer messages. Topics created:");
                log.info("  - inventory.updated");
                log.info("  - order.created");
                log.info("  - order.fulfilled");
                log.info("  - user.activity");
                
            } catch (Exception e) {
                log.error("Kafka test failed", e);
            }
        };
    }

    private void publishInventoryTestEvent(InventoryProducerService producer) {
        log.info("Publishing test inventory update...");
        
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
                .productId(1L)
                .quantity(85)
                .previousQuantity(100)
                .sellerId(1L)
                .reorderThreshold(10)
                .eventSource("MANUAL_UPDATE")
                .timestamp(Instant.now())
                .build();
        
        producer.publishInventoryUpdate(event);
        log.info("Published: {}", event);
    }

    private void publishOrderTestEvent(OrderProducerService producer) {
        log.info("Publishing test order creation...");
        
        OrderCreatedEvent.OrderItemDetail item = OrderCreatedEvent.OrderItemDetail.builder()
                .productId(1L)
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(99.99))
                .sellerId(1L)
                .build();
        
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(1001L)
                .userId(1L)
                .sellerIds(List.of(1L))
                .totalAmount(BigDecimal.valueOf(199.98))
                .itemCount(1)
                .status("PENDING")
                .paymentMethod("STRIPE")
                .shippingAddressId(1L)
                .items(List.of(item))
                .timestamp(Instant.now())
                .build();
        
        producer.publishOrderCreated(event);
        log.info("Published: {}", event);
    }

    private void publishActivityTestEvents(UserActivityProducerService producer) {
        log.info("Publishing test user activity events...");
        
        // Product view
        UserActivityEvent viewEvent = UserActivityEvent.builder()
            .userId("1")
                .eventType(UserActivityEvent.ActivityType.PRODUCT_VIEW)
                .productId(1L)
                .sessionId("session-123")
                .pageUrl("/products/1")
                .deviceType("DESKTOP")
                .timestamp(Instant.now())
                .durationMs(30000L)
                .build();
        producer.publishUserActivity(viewEvent);
        log.info("Published view event: {}", viewEvent);
        
        // Cart add
        UserActivityEvent cartEvent = UserActivityEvent.builder()
            .userId("1")
                .eventType(UserActivityEvent.ActivityType.CART_ADD)
                .productId(1L)
                .quantity(2)
                .sessionId("session-123")
                .timestamp(Instant.now())
                .build();
        producer.publishUserActivity(cartEvent);
        log.info("Published cart event: {}", cartEvent);
        
        // Search event
        UserActivityEvent searchEvent = UserActivityEvent.builder()
            .userId("1")
                .eventType(UserActivityEvent.ActivityType.PRODUCT_SEARCH)
                .searchQuery("wireless headphones")
                .sessionId("session-123")
                .timestamp(Instant.now())
                .build();
        producer.publishUserActivity(searchEvent);
        log.info("Published search event: {}", searchEvent);
    }
}
