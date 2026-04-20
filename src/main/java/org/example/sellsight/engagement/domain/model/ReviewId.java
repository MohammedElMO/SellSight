package org.example.sellsight.engagement.domain.model;

import java.util.Objects;
import java.util.UUID;

/** Value object — strongly-typed review identifier. */
public record ReviewId(UUID value) {
    public ReviewId {
        Objects.requireNonNull(value, "ReviewId cannot be null");
    }

    public static ReviewId generate() {
        return new ReviewId(UUID.randomUUID());
    }

    public static ReviewId of(UUID value) {
        return new ReviewId(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
