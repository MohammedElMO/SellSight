package org.example.sellsight.user.application.dto;

import java.time.LocalDateTime;

public record SellerApplicationDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String sellerStatus,
        LocalDateTime createdAt
) {}
