package org.example.sellsight.loyalty.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record LoyaltyAccountDto(
        String userId,
        int balance,
        BigDecimal balanceAsDollars,
        BigDecimal lifetimeSpend,
        String tier,
        String referralCode,
        List<LoyaltyTransactionDto> recentTransactions
) {
    public record LoyaltyTransactionDto(
            String id,
            String type,
            int points,
            String description,
            String orderId,
            LocalDateTime createdAt
    ) {}
}
