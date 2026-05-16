package org.example.sellsight.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.UserActivityEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Producer service for user activity events.
 * Emits events to the user.activity topic for views, cart adds, wishlist, searches, etc.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserActivityProducerService {

    private static final String USER_ACTIVITY_TOPIC = "user.activity";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Publish a user activity event.
     * Uses user_id as the message key for partitioning by user (enables user-centric aggregations).
     *
     * @param event the user activity event
     */
    public void publishUserActivity(UserActivityEvent event) {
        try {
            String messageKey = event.getUserId();
            String messageValue = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(USER_ACTIVITY_TOPIC, messageKey, messageValue).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish user activity event for user_id={}, event_type={}: {}", 
                            event.getUserId(), event.getEventType(), ex.getMessage(), ex);
                } else {
                    log.debug("Published user activity event for user_id={}, event_type={} to partition={}",
                            event.getUserId(),
                            event.getEventType(),
                            result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.error("Error serializing user activity event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish user activity event", e);
        }
    }
}
