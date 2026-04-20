package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.application.event.AnalyticsEventRecorded;
import org.example.sellsight.analytics.domain.model.AnalyticsEvent;
import org.example.sellsight.analytics.domain.model.EventType;
import org.example.sellsight.analytics.domain.repository.EventRepository;
import org.example.sellsight.shared.events.EventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Records a user interaction event.
 *
 * Transitional state: writes to user_events table AND publishes to Kafka.
 * The Postgres write will be removed in a follow-up session (TASK.md §6 says
 * behavioral events should be Kafka-only) once downstream consumers exist.
 */
@Component
public class RecordEventUseCase {

    private final EventRepository eventRepository;
    private final EventPublisher eventPublisher;
    private final String userEventsTopic;

    public RecordEventUseCase(EventRepository eventRepository,
                              EventPublisher eventPublisher,
                              @Value("${app.kafka.topics.user-events:user-events}") String userEventsTopic) {
        this.eventRepository = eventRepository;
        this.eventPublisher = eventPublisher;
        this.userEventsTopic = userEventsTopic;
    }

    public void execute(String userId,
                        String productId,
                        EventType eventType,
                        String sessionId,
                        BigDecimal price) {

        LocalDateTime now = LocalDateTime.now();

        AnalyticsEvent event = new AnalyticsEvent(
                userId,
                productId,
                eventType,
                sessionId,
                price,
                now
        );

        eventRepository.save(event);

        eventPublisher.publish(userEventsTopic,
                new AnalyticsEventRecorded(userId, productId, eventType, sessionId, price, now));
    }
}
