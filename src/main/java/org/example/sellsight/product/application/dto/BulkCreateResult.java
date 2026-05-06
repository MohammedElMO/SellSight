package org.example.sellsight.product.application.dto;

import java.util.List;

/**
 * Result of a bulk product CSV upload.
 */
public record BulkCreateResult(
        int created,
        int failed,
        List<BulkRowError> errors
) {
    public record BulkRowError(int row, String message) {}
}
