package org.example.sellsight.analytics.application.event;

import org.example.sellsight.analytics.domain.model.EventType;
import org.example.sellsight.shared.events.DomainEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnalyticsEventRecorded(
        String userId,
        String productId,
        EventType analyticsEventType,
        String sessionId,
        BigDecimal price,
        LocalDateTime timestamp
) implements DomainEvent {

    @Override
    public String eventType() {
        return "analytics." + analyticsEventType.name().toLowerCase();
    }
}
