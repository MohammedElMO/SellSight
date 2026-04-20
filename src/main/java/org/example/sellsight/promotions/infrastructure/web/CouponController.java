package org.example.sellsight.promotions.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.promotions.application.dto.CouponDto;
import org.example.sellsight.promotions.application.usecase.ValidateCouponUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Tag(name = "Coupons", description = "Validate and apply discount codes")
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final ValidateCouponUseCase validateCouponUseCase;

    public CouponController(ValidateCouponUseCase validateCouponUseCase) {
        this.validateCouponUseCase = validateCouponUseCase;
    }

    @Operation(operationId = "validateCoupon", summary = "Validate a coupon code",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/validate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CouponDto> validate(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        BigDecimal subtotal = new BigDecimal(body.getOrDefault("subtotal", "0"));
        return ResponseEntity.ok(validateCouponUseCase.execute(code, subtotal));
    }
}
