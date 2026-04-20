package org.example.sellsight.shared.events.infrastructure;

import java.time.Instant;
import java.util.UUID;

/**
 * Wire format for Kafka events. Keeping envelope + payload separate lets
 * consumers dispatch on eventType without deserializing the payload first.
 */
public record EventEnvelope(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        Object payload
) {}
