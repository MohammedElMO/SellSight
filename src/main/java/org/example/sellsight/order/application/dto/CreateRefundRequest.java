package org.example.sellsight.order.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRefundRequest(
        @NotBlank @Size(min = 10, max = 1000) String reason
) {}
