package org.example.sellsight.inventory.application.dto;

public record StockDto(
        String productId,
        int quantity,
        int reorderThreshold,
        boolean lowStock
) {}
