package org.example.sellsight.order.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object for unique order identifier.
 */
public final class OrderId {

    private final UUID value;

    private OrderId(UUID value) {
        this.value = Objects.requireNonNull(value);
    }

    public static OrderId generate() { return new OrderId(UUID.randomUUID()); }
    public static OrderId from(String value) { return new OrderId(UUID.fromString(value)); }
    public String getValue() { return value.toString(); }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return value.equals(((OrderId) o).value);
    }
    @Override public int hashCode() { return value.hashCode(); }
    @Override public String toString() { return value.toString(); }
}
