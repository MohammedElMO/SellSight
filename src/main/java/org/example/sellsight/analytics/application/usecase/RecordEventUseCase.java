package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.domain.model.AnalyticsEvent;
import org.example.sellsight.analytics.domain.model.EventType;
import org.example.sellsight.analytics.domain.repository.EventRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Records a user interaction event.
 *
 * Phase 1 (current): writes directly to the user_events table for local verification
 * against the dataset. No Kafka dependency yet — swap the EventRepository
 * implementation to a KafkaEventAdapter when the pipeline is ready.
 *
 * Phase 2: replace (or complement) EventRepository with a Kafka producer so events
 * flow: Backend → Kafka → HDFS → Spark → DB.
 */
@Component
public class RecordEventUseCase {

    private final EventRepository eventRepository;

    public RecordEventUseCase(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public void execute(String userId,
                        String productId,
                        EventType eventType,
                        String sessionId,
                        BigDecimal price) {

        AnalyticsEvent event = new AnalyticsEvent(
                userId,
                productId,
                eventType,
                sessionId,
                price,
                LocalDateTime.now()
        );

        eventRepository.save(event);
    }
}
