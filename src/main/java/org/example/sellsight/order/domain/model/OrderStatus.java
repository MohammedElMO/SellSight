package org.example.sellsight.order.domain.model;

/**
 * Order lifecycle states. Transitions follow a strict state machine.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
