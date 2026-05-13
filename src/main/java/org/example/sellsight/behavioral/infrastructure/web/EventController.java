package org.example.sellsight.behavioral.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.event.UserActivityEvent;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

/**
 * Fire-and-forget event endpoint. Receives batched behavioral events from
 * the frontend and publishes each to Kafka. No Postgres writes.
 */
@Slf4j
@Tag(name = "Events", description = "Behavioral event tracking — fire-and-forget to Kafka")
@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private static final String TOPIC = "user.activity";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    public EventController(KafkaTemplate<String, String> kafkaTemplate,
                            ObjectMapper objectMapper,
                            UserRepository userRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
    }

    @Operation(operationId = "publishEvents", summary = "Publish batched behavioral events to Kafka")
    @PostMapping
    public ResponseEntity<Void> publishEvents(@RequestBody Map<String, Object> payload,
                                              Authentication authentication) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> events = (List<Map<String, Object>>) payload.get("events");
            if (events == null || events.isEmpty()) {
                log.warn("EventController: received null or empty events list");
                return ResponseEntity.noContent().build();
            }

            log.info("EventController: processing {} events, auth={}", events.size(), 
                    authentication != null ? authentication.getName() : "anonymous");

            for (Map<String, Object> event : events) {
                UserActivityEvent activityEvent = toActivityEvent(event, authentication);
                if (activityEvent == null) {
                    log.warn("EventController: toActivityEvent returned null for event: {}", event);
                    continue;
                }

                String value = objectMapper.writeValueAsString(activityEvent);
                log.debug("EventController: publishing event userId={}, eventType={}", 
                        activityEvent.getUserId(), activityEvent.getEventType());
                kafkaTemplate.send(TOPIC, activityEvent.getUserId(), value);
            }

            log.info("EventController: successfully published {} events", events.size());
            return ResponseEntity.accepted().build();
        } catch (Exception e) {
            // Log but don't fail — fire-and-forget
            log.error("EventController: exception in publishEvents", e);
            return ResponseEntity.accepted().build();
        }
    }

    private UserActivityEvent toActivityEvent(Map<String, Object> event, Authentication authentication) {
        String userId = resolveUserId(event, authentication);
        if (userId == null) {
            return null;
        }

        UserActivityEvent.ActivityType activityType = resolveActivityType(event);
        if (activityType == null) {
            return null;
        }

        return UserActivityEvent.builder()
                .userId(userId)
                .eventType(activityType)
                .productId(asString(event.get("productId")))
                .categoryId(asLong(event.get("categoryId")))
                .sellerId(asLong(event.get("sellerId")))
                .sessionId(asString(event.get("sessionId")))
                .pageUrl(asString(event.get("url")))
                .referrer(asString(event.get("referrer")))
                .quantity(asInteger(event.get("quantity")))
                .searchQuery(asString(event.get("searchQuery")))
                .deviceType(asString(event.get("deviceType")))
                .ipAddress(asString(event.get("ipAddress")))
                .timestamp(resolveTimestamp(event.get("timestamp")))
                .durationMs(asLong(event.get("durationMs")))
                .build();
    }

    private String resolveUserId(Map<String, Object> event, Authentication authentication) {
        String explicitUserId = asString(event.get("userId"));
        if (explicitUserId != null) {
            log.debug("EventController: resolved userId from event: {}", explicitUserId);
            return explicitUserId;
        }

        String userEmail = asString(event.get("userEmail"));
        if (userEmail == null && authentication != null && authentication.getName() != null
                && !"anonymousUser".equals(authentication.getName())) {
            userEmail = authentication.getName();
        }

        if (userEmail == null) {
            log.warn("EventController: could not resolve userEmail or userId");
            return null;
        }

        String resolvedId = userRepository.findByEmail(new Email(userEmail))
                .map(user -> user.getId().getValue())
                .orElse(userEmail);
        log.debug("EventController: resolved userId={} from email={}", resolvedId, userEmail);
        return resolvedId;
    }

    private UserActivityEvent.ActivityType resolveActivityType(Map<String, Object> event) {
        String eventName = asString(event.get("eventName"));
        if (eventName == null) {
            eventName = asString(event.get("event_type"));
        }
        if (eventName == null) {
            eventName = asString(event.get("eventType"));
        }

        if (eventName == null) {
            return null;
        }

        return switch (eventName) {
            case "PRODUCT_VIEW" -> UserActivityEvent.ActivityType.PRODUCT_VIEW;
            case "ADD_TO_CART" -> UserActivityEvent.ActivityType.CART_ADD;
            case "PURCHASE" -> UserActivityEvent.ActivityType.ORDER_PLACED;
            case "PAGE_VIEW", "CHECKOUT_START" -> UserActivityEvent.ActivityType.CATEGORY_VIEW;
            case "REMOVE_FROM_CART" -> UserActivityEvent.ActivityType.CART_REMOVE;
            case "WISHLIST_ADD" -> UserActivityEvent.ActivityType.WISHLIST_ADD;
            case "WISHLIST_REMOVE" -> UserActivityEvent.ActivityType.WISHLIST_REMOVE;
            case "PRODUCT_SEARCH" -> UserActivityEvent.ActivityType.PRODUCT_SEARCH;
            default -> null;
        };
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }

    private Instant resolveTimestamp(Object value) {
        if (value == null) {
            return Instant.now();
        }

        try {
            return Instant.parse(String.valueOf(value));
        } catch (Exception ignored) {
            return LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant();
        }
    }
}
