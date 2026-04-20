package org.example.sellsight.engagement.application.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record CreateReviewRequest(
        @NotBlank String productId,
        @Min(1) @Max(5) int rating,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String body,
        List<String> imageUrls
) {}
