package org.example.sellsight.shared.events;

/**
 * Outbound port for publishing domain events. Default adapter is Kafka; tests
 * can wire a no-op or in-memory adapter via a @Primary bean.
 */
public interface EventPublisher {

    /**
     * Publish an event to the given topic. Fire-and-forget from the caller's
     * perspective — the adapter handles serialization and delivery semantics.
     */
    void publish(String topic, DomainEvent event);
}
