package org.example.sellsight.shared.events.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.shared.events.DomainEvent;
import org.example.sellsight.shared.events.EventPublisher;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventPublisher implements EventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void publish(String topic, DomainEvent event) {
        EventEnvelope envelope = new EventEnvelope(
                event.eventId(),
                event.eventType(),
                event.occurredAt(),
                event
        );
        try {
            String payload = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(topic, event.eventType(), payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish event {} to topic {}: {}",
                                    event.eventType(), topic, ex.getMessage());
                        }
                    });
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize event {}: {}", event.eventType(), e.getMessage());
        }
    }
}
