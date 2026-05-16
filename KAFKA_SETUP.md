# Kafka Producer/Consumer Implementation Guide

## Overview
This document describes the Kafka real-time event streaming infrastructure for SellSight (Option A of Lambda Architecture).

## Architecture

### Kafka Topics (4 Topics)
1. **inventory.updated**
   - Triggered: When product stock levels change
   - Partitions: 3 (parallel processing by product_id)
   - Use cases: Low-stock alerts, cache updates, inventory dashboards
   
2. **order.created**
   - Triggered: When a new order is placed
   - Partitions: 3 (parallel processing by order_id)
   - Use cases: Order confirmation emails, inventory decrement, fulfillment workflows
   
3. **order.fulfilled**
   - Triggered: When order status changes (shipped, delivered, cancelled, refunded)
   - Partitions: 3
   - Use cases: Customer notifications, status updates, seller performance metrics
   
4. **user.activity**
   - Triggered: User actions (product view, cart add, search, purchase)
   - Partitions: 3 (parallel processing by user_id)
   - Use cases: Personalized recommendations, funnel analytics, user segmentation

## Event Classes (DTOs)

Located in: `src/main/java/org/example/sellsight/event/`

### InventoryUpdatedEvent
```
- product_id: Long
- quantity: Integer
- previous_quantity: Integer
- seller_id: Long
- reorder_threshold: Integer
- event_source: String (ORDER_FULFILLED, MANUAL_UPDATE, REFUND)
- timestamp: Instant
```

### OrderCreatedEvent
```
- order_id: Long
- user_id: Long
- seller_ids: List<Long>
- total_amount: BigDecimal
- item_count: Integer
- status: String
- payment_method: String
- items: List<OrderItemDetail>
- timestamp: Instant
```

### OrderFulfilledEvent
```
- order_id: Long
- user_id: Long
- status: String (SHIPPED, DELIVERED, CANCELLED, REFUNDED)
- previous_status: String
- seller_id: Long
- tracking_number: String
- shipped_at: Instant
- delivered_at: Instant
- timestamp: Instant
```

### UserActivityEvent
```
- user_id: Long
- event_type: enum (PRODUCT_VIEW, CART_ADD, WISHLIST_ADD, SEARCH, etc.)
- product_id: Long (optional)
- category_id: Long (optional)
- quantity: Integer (for cart/wishlist)
- search_query: String (for search events)
- device_type: String (MOBILE, DESKTOP)
- session_id: String
- timestamp: Instant
- duration_ms: Long
```

## Producer Services

Located in: `src/main/java/org/example/sellsight/kafka/producer/`

### InventoryProducerService
- `publishInventoryUpdate(InventoryUpdatedEvent event)`
- **Usage**: Call when product quantity changes
- **Key partitioning**: By product_id

### OrderProducerService
- `publishOrderCreated(OrderCreatedEvent event)`
- `publishOrderFulfilled(OrderFulfilledEvent event)`
- **Usage**: Call after order creation, on status updates
- **Key partitioning**: By order_id

### UserActivityProducerService
- `publishUserActivity(UserActivityEvent event)`
- **Usage**: Call on product views, cart adds, searches, purchases
- **Key partitioning**: By user_id

## Consumer Services

Located in: `src/main/java/org/example/sellsight/kafka/consumer/`

### InventoryConsumer
- Listens to: `inventory.updated`
- Consumer group: `sellsight-inventory-service`
- Responsibilities:
  - Detect low-stock alerts
  - Update Redis cache
  - Trigger reorder notifications (TODO)

### OrderConsumer
- Listens to: `order.created`, `order.fulfilled`
- Consumer group: `sellsight-order-service`
- Responsibilities:
  - Send order confirmation emails (TODO)
  - Update order cache
  - Trigger inventory decrement
  - Handle shipment workflows (TODO)

### ActivityConsumer
- Listens to: `user.activity`
- Consumer group: `sellsight-analytics-service`
- Responsibilities:
  - Update recently viewed products
  - Feed recommendation engine
  - Track funnel metrics (view → cart → purchase)
  - User segmentation for campaigns

## Configuration

### application.yml
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:29092  # External access
    producer:
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      properties:
        enable.idempotence: true
    consumer:
      group-id: sellsight-analytics
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      properties:
        spring.json.trusted.packages: "*"
```

### Docker Compose
```yaml
kafka:
  image: bitnamilegacy/kafka:3.7
  ports:
    - "9092:9092"      # Internal broker
    - "29092:29092"    # External access
  environment:
    KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "true"
```

## How to Integrate Producers

### Example 1: Emit inventory update
```java
@Service
public class InventoryService {
    @Autowired private InventoryProducerService producer;
    
    public void updateInventory(Long productId, Integer newQuantity) {
        // ... update database
        
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
            .productId(productId)
            .quantity(newQuantity)
            // ... populate other fields
            .timestamp(Instant.now())
            .build();
        
        producer.publishInventoryUpdate(event);
    }
}
```

### Example 2: Emit order created
```java
@Service
public class OrderService {
    @Autowired private OrderProducerService producer;
    
    public Order createOrder(Order order) {
        Order saved = orderRepository.save(order);
        
        OrderCreatedEvent event = OrderCreatedEvent.builder()
            .orderId(saved.getId())
            .userId(saved.getUserId())
            // ... populate fields
            .timestamp(Instant.now())
            .build();
        
        producer.publishOrderCreated(event);
        return saved;
    }
}
```

### Example 3: Emit user activity
```java
@RestController
public class ProductController {
    @Autowired private UserActivityProducerService producer;
    
    @GetMapping("/products/{id}")
    public ProductDto getProduct(@PathVariable Long id) {
        UserActivityEvent event = UserActivityEvent.builder()
            .userId(currentUser.getId())
            .eventType(UserActivityEvent.ActivityType.PRODUCT_VIEW)
            .productId(id)
            .sessionId(sessionId)
            .timestamp(Instant.now())
            .build();
        
        producer.publishUserActivity(event);
        return productService.getProduct(id);
    }
}
```

## Testing Kafka

### Using Test Profile
```bash
# Start with kafka-test profile to publish test events
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=kafka-test"
```

This will:
1. Publish test inventory update
2. Publish test order created
3. Publish test user activity events
4. Create all 4 topics automatically

### Verify Topics in Kafka
```bash
# List topics
docker exec sellsight-kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Expected output:
# inventory.updated
# order.created
# order.fulfilled
# user.activity

# Describe a topic
docker exec sellsight-kafka kafka-topics.sh --describe --topic inventory.updated --bootstrap-server localhost:9092

# Read messages from a topic (from latest)
docker exec sellsight-kafka kafka-console-consumer.sh \
  --topic inventory.updated \
  --from-beginning \
  --bootstrap-server localhost:9092
```

## Key Design Decisions

1. **Partitioning Strategy**
   - inventory.updated → Partitioned by product_id (aggregate per product)
   - order.created/fulfilled → Partitioned by order_id (maintain order sequence)
   - user.activity → Partitioned by user_id (aggregate user events)

2. **Serialization**
   - JSON serialization for event payloads
   - Spring's JsonSerializer/JsonDeserializer (automatic)
   - Trusted packages: "*" (all packages allowed)

3. **Consumer Groups**
   - Each consumer service has a unique group ID
   - Allows independent processing of events
   - Different groups can replay messages independently

4. **Replication & ACKs**
   - acks=all (wait for all in-sync replicas)
   - enable.idempotence=true (exactly-once semantics)
   - Production-ready settings

5. **Auto-offset Management**
   - auto-offset-reset=earliest (start from beginning if no offset found)
   - Enable auto-commit (every 1000ms)
   - Suitable for non-critical analytics

## Next Steps (Option B: Hadoop/Hive)

After validating Kafka producers/consumers:
1. Set up Hadoop HDFS (NameNode, DataNode)
2. Configure Hive with PostgreSQL metastore
3. Create Sqoop jobs to export PostgreSQL → HDFS
4. Define Hive analytical tables
5. Schedule nightly batch aggregations
6. Expose analytics via REST endpoints

## Monitoring & Debugging

### Check Consumer Lag
```bash
docker exec sellsight-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --group sellsight-analytics
```

### Check Kafka Broker Health
```bash
docker logs -f sellsight-kafka
```

### Enable Debug Logging
Set in application.yml:
```yaml
logging:
  level:
    org.apache.kafka: DEBUG
    org.springframework.kafka: DEBUG
    org.example.sellsight.kafka: DEBUG
```

## Common Issues & Solutions

### Issue: "Topic does not exist"
- Ensure `KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true` in docker-compose
- Or manually create with: `docker exec sellsight-kafka kafka-topics.sh --create --topic NAME --bootstrap-server localhost:9092`

### Issue: Consumer not receiving messages
- Check group ID matches consumer annotation
- Verify topic name spelling
- Check consumer group offsets: `kafka-consumer-groups.sh --describe --group <group-id>`

### Issue: Serialization errors
- Ensure event classes have no-arg constructors (@NoArgsConstructor)
- Check @JsonProperty annotations match event field names
- Verify TRUSTED_PACKAGES setting

## References

- [Spring Kafka Documentation](https://spring.io/projects/spring-kafka)
- [Apache Kafka Official Docs](https://kafka.apache.org/documentation/)
- [Bitnam Kafka Docker Image](https://hub.docker.com/r/bitnami/kafka)
