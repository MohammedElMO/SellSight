package org.example.sellsight.shared.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Marker interface for domain events published to Kafka. Implementations are
 * usually immutable records carrying only primitives + value-object strings —
 * never JPA entities, never framework types.
 */
public interface DomainEvent {

    default UUID eventId() {
        return UUID.randomUUID();
    }

    default Instant occurredAt() {
        return Instant.now();
    }

    /** Event type discriminator used as the Kafka message key envelope field. */
    String eventType();
}
