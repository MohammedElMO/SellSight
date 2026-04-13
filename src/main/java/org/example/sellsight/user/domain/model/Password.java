package org.example.sellsight.user.domain.model;

import java.util.Objects;

/**
 * Value Object holding the hashed password.
 * The raw password is never stored — only the BCrypt hash.
 * Hashing is done in the application layer, not here.
 */
public final class Password {

    private final String hashedValue;

    public Password(String hashedValue) {
        this.hashedValue = Objects.requireNonNull(hashedValue, "Password hash cannot be null");
        if (hashedValue.isBlank()) {
            throw new IllegalArgumentException("Password hash cannot be empty");
        }
    }

    public String getHashedValue() {
        return hashedValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Password password = (Password) o;
        return hashedValue.equals(password.hashedValue);
    }

    @Override
    public int hashCode() {
        return hashedValue.hashCode();
    }

    @Override
    public String toString() {
        return "[PROTECTED]";
    }
}
