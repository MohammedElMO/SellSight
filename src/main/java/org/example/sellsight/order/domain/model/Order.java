package org.example.sellsight.order.domain.model;

import org.example.sellsight.order.domain.exception.InvalidOrderStateException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Order aggregate root.
 * Contains OrderItems, manages status transitions, calculates total.
 * Immutable after confirmation (no adding/removing items).
 */
public class Order {

    private final OrderId id;
    private final String customerId;
    private final List<OrderItem> items;
    private OrderStatus status;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order(OrderId id, String customerId, List<OrderItem> items,
                 OrderStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = Objects.requireNonNull(id);
        this.customerId = Objects.requireNonNull(customerId);
        this.items = new ArrayList<>(items != null ? items : List.of());
        this.status = Objects.requireNonNull(status);
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = updatedAt;
    }

    // ── Business Methods ────────────────────────────────────────

    public void addItem(OrderItem item) {
        if (status != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Cannot add items to a " + status + " order");
        }
        this.items.add(Objects.requireNonNull(item));
        this.updatedAt = LocalDateTime.now();
    }

    public void confirm() {
        if (status != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Cannot confirm a " + status + " order");
        }
        if (items.isEmpty()) {
            throw new InvalidOrderStateException("Cannot confirm an order with no items");
        }
        this.status = OrderStatus.CONFIRMED;
        this.updatedAt = LocalDateTime.now();
    }

    public void ship() {
        if (status != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Cannot ship a " + status + " order");
        }
        this.status = OrderStatus.SHIPPED;
        this.updatedAt = LocalDateTime.now();
    }

    public void deliver() {
        if (status != OrderStatus.SHIPPED) {
            throw new InvalidOrderStateException("Cannot deliver a " + status + " order");
        }
        this.status = OrderStatus.DELIVERED;
        this.updatedAt = LocalDateTime.now();
    }

    public void cancel() {
        if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cannot cancel a " + status + " order");
        }
        this.status = OrderStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Total is derived from items — not stored.
     */
    public BigDecimal getTotal() {
        return items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── Getters ─────────────────────────────────────────────────

    public OrderId getId() { return id; }
    public String getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id.equals(((Order) o).id);
    }

    @Override
    public int hashCode() { return id.hashCode(); }
}
