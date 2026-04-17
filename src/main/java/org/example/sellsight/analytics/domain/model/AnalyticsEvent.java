package org.example.sellsight.analytics.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable domain record representing a single user interaction event.
 *
 * Phase 1: persisted directly to the user_events table for local verification.
 * Phase 2: will be emitted to Kafka → HDFS → Spark and the table becomes
 *           a materialised view of aggregated results from the pipeline.
 *
 * Pure Java — no framework annotations.
 */
public record AnalyticsEvent(
        String userId,
        String productId,
        EventType eventType,
        String sessionId,
        BigDecimal price,
        LocalDateTime timestamp
) {
    /** Compact constructor validates mandatory fields. */
    public AnalyticsEvent {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("AnalyticsEvent: userId is required");
        }
        if (eventType == null) {
            throw new IllegalArgumentException("AnalyticsEvent: eventType is required");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("AnalyticsEvent: timestamp is required");
        }
    }
}
