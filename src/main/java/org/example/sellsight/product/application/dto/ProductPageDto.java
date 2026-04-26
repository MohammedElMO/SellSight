package org.example.sellsight.product.application.dto;

import java.util.List;

/**
 * DTO for paginated product responses.
 */
public record ProductPageDto(
        List<ProductDto> products,
        int page,
        int size,
        boolean hasMore,
        int totalPages,
        long totalElements,
        String searchMode
) {}
