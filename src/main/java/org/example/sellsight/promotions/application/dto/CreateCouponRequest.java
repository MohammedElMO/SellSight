package org.example.sellsight.promotions.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateCouponRequest(
        @NotBlank String code,
        @NotNull String type,
        @NotNull @Positive BigDecimal value,
        @DecimalMin("0") BigDecimal minOrder,
        Integer maxUses,
        @NotNull LocalDateTime startsAt,
        @NotNull LocalDateTime expiresAt
) {}
