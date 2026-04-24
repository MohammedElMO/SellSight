package org.example.sellsight.inventory.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchUpdateStockRequest(
        @Valid @NotEmpty List<BatchUpdateStockItem> items
) {}
