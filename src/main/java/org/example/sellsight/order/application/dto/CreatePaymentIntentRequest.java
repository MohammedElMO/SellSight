package org.example.sellsight.order.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreatePaymentIntentRequest(
    @Min(1) long amount,
    @NotBlank String orderId
) {}
