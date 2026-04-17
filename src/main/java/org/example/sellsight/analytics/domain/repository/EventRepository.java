package org.example.sellsight.analytics.domain.repository;

import org.example.sellsight.analytics.domain.model.AnalyticsEvent;

import java.util.List;

/**
 * Port — domain interface for event persistence.
 * The infrastructclcure adapter implements this; the domain never sees JPA.
 */
public interface EventRepository {

    /** Persists a single event. */
    void save(AnalyticsEvent event);

    /** Returns all events attributed to a given user (used for Phase 1 verification). */
    List<AnalyticsEvent> findByUserId(String userId);

    /** Returns all events associated with a given product (used for Phase 1 verification). */
    List<AnalyticsEvent> findByProductId(String productId);
}
