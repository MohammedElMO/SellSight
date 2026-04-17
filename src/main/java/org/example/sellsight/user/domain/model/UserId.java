package org.example.sellsight.user.domain.model;

import lombok.EqualsAndHashCode;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing a unique user identifier.
 * Wraps a String to support both standard UUIDs (real users)
 * and external dataset IDs such as numeric strings or long UUIDs
 * used by virtual/simulated users.
 */
@EqualsAndHashCode
public final class UserId {

    private final String value;

    private UserId(String value) {
        this.value = Objects.requireNonNull(value, "UserId value cannot be null");
    }

    /** Creates a new UUID-based identifier for real users. */
    public static UserId generate() {
        return new UserId(UUID.randomUUID().toString());
    }

    /**
     * Creates an identifier from an existing string.
     * Accepts any non-blank string — including numeric IDs from external datasets.
     */
    public static UserId from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("UserId cannot be blank");
        }
        return new UserId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
