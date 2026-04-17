package org.example.sellsight.analytics.domain.model;

/**
 * The set of trackable user interactions.
 * Used in both the domain record and the JPA entity to avoid raw strings.
 */
public enum EventType {
    VIEW,
    CLICK,
    ADD_TO_CART,
    PURCHASE
}
