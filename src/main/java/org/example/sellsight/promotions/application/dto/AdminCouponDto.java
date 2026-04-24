package org.example.sellsight.promotions.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminCouponDto(
        String id,
        String code,
        String type,
        BigDecimal value,
        BigDecimal minOrder,
        Integer maxUses,
        int usedCount,
        LocalDateTime startsAt,
        LocalDateTime expiresAt,
        boolean active
) {}
