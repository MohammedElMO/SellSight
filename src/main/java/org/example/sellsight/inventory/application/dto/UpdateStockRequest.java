package org.example.sellsight.inventory.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateStockRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        @Min(value = 0, message = "Reorder threshold cannot be negative")
        Integer reorderThreshold
) {}
