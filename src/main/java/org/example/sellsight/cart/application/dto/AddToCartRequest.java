package org.example.sellsight.cart.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddToCartRequest(
        @NotBlank String productId,
        @Min(1) int quantity
) {}
