package org.example.sellsight.behavioral.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

/**
 * Fire-and-forget event endpoint. Receives batched behavioral events from
 * the frontend and publishes each to Kafka. No Postgres writes.
 */
@Tag(name = "Events", description = "Behavioral event tracking — fire-and-forget to Kafka")
@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private static final String TOPIC = "user-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public EventController(KafkaTemplate<String, String> kafkaTemplate,
                            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Operation(operationId = "publishEvents", summary = "Publish batched behavioral events to Kafka")
    @PostMapping
    public ResponseEntity<Void> publishEvents(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> events = (List<Map<String, Object>>) payload.get("events");
            if (events == null || events.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            for (Map<String, Object> event : events) {
                String key = (String) event.getOrDefault("userId", "anonymous");
                String value = objectMapper.writeValueAsString(event);
                kafkaTemplate.send(TOPIC, key, value);
            }

            return ResponseEntity.accepted().build();
        } catch (Exception e) {
            // Log but don't fail — fire-and-forget
            return ResponseEntity.accepted().build();
        }
    }
}
