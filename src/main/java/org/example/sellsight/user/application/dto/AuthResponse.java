package org.example.sellsight.user.application.dto;

/**
 * DTO returned after successful authentication (register or login).
 */
public record AuthResponse(
        String token,
        String email,
        String role,
        String firstName,
        String lastName,
        boolean emailVerified,
        String sellerStatus
) {}
