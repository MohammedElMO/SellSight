package org.example.sellsight.shared.exception;

import java.time.LocalDateTime;

/**
 * Standard error response format for REST endpoints.
 */
public record ErrorResponse(
        int status,
        String message,
        LocalDateTime timestamp,
        String errorCode
) {
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, LocalDateTime.now(), null);
    }

    public static ErrorResponse of(int status, String message, String errorCode) {
        return new ErrorResponse(status, message, LocalDateTime.now(), errorCode);
    }
}
