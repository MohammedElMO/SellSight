package org.example.sellsight.loyalty.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

/** Immutable ledger entry for a points transaction. */
public record LoyaltyTransaction(
        UUID id,
        String userId,
        TransactionType type,
        int points,
        String description,
        String orderId,
        LocalDateTime createdAt
) {}
