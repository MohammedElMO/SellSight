package org.example.sellsight.shared.exception;

import java.time.LocalDateTime;

/**
 * Standard error response format for REST endpoints.
 */
public record ErrorResponse(
        int status,
        String message,
        LocalDateTime timestamp
) {
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, LocalDateTime.now());
    }
}
