package org.example.sellsight.promotions.application.dto;

import java.math.BigDecimal;

public record CouponDto(
        String id,
        String code,
        String type,
        BigDecimal value,
        BigDecimal minOrder,
        BigDecimal discount
) {}
