package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressDto(
        String id,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Size(max = 50) String label,
        @NotBlank String street,
        @NotBlank String city,
        String state,
        @NotBlank String zip,
        String country,
        String phone,
        boolean isDefaultShipping,
        boolean isDefaultBilling
) {}
