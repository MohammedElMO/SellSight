package org.example.sellsight.user.application.dto;

import java.util.List;

public record Setup2faCompleteResponse(
        String email,
        String role,
        String firstName,
        String lastName,
        boolean emailVerified,
        String sellerStatus,
        List<String> backupCodes
) {}
