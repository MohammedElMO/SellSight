package org.example.sellsight.inventory.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BatchUpdateStockItem(
        @NotBlank String productId,
        @Min(0)   int quantity
) {}
