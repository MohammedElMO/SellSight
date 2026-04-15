package org.example.sellsight.user.domain.model;

import lombok.EqualsAndHashCode;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing a unique user identifier.
 * Immutable and equality based on the underlying UUID.
 */
@EqualsAndHashCode
public final class UserId {

    private final UUID value;

    private UserId(UUID value) {
        this.value = Objects.requireNonNull(value, "UserId value cannot be null");
    }

    public static UserId generate() {
        return new UserId(UUID.randomUUID());
    }

    public static UserId from(String value) {
        return new UserId(UUID.fromString(value));
    }

    public String getValue() {
        return value.toString();
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
