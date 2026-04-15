package org.example.sellsight.user.domain.model;

import lombok.EqualsAndHashCode;
import org.example.sellsight.user.domain.exception.InvalidEmailException;

import java.util.regex.Pattern;

/**
 * Value Object representing a validated email address.
 * Validates format on construction — fails fast on invalid input.
 */
@EqualsAndHashCode
public final class Email {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final String value;

    public Email(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be empty");
        }
        String trimmed = value.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(trimmed).matches()) {
            throw new InvalidEmailException("Invalid email format: " + value);
        }
        this.value = trimmed;
    }

    public String getValue() {
        return value;
    }



    @Override
    public String toString() {
        return value;
    }
}
