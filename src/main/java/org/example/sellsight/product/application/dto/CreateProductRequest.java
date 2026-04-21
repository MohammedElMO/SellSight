package org.example.sellsight.product.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for creating a new product.
 */
public record CreateProductRequest(
        @NotBlank(message = "Product name is required")
        String name,

        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,

        @NotBlank(message = "Category is required")
        String category,

        String imageUrl,

        @Min(value = 0, message = "Initial stock cannot be negative")
        Integer initialStock
) {}
