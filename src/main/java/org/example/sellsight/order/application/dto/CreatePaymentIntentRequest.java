package org.example.sellsight.order.application.dto;

import jakarta.validation.constraints.Min;

public record CreatePaymentIntentRequest(
    @Min(1) long amount
) {}
