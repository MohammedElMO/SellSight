package org.example.sellsight.promotions.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.promotions.application.dto.AdminCouponDto;
import org.example.sellsight.promotions.application.dto.CouponDto;
import org.example.sellsight.promotions.application.dto.CreateCouponRequest;
import org.example.sellsight.promotions.application.usecase.CreateCouponUseCase;
import org.example.sellsight.promotions.application.usecase.DeleteCouponUseCase;
import org.example.sellsight.promotions.application.usecase.ListCouponsUseCase;
import org.example.sellsight.promotions.application.usecase.ValidateCouponUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "Coupons", description = "Validate and apply discount codes; ADMIN CRUD")
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final ValidateCouponUseCase validateCouponUseCase;
    private final ListCouponsUseCase listCouponsUseCase;
    private final CreateCouponUseCase createCouponUseCase;
    private final DeleteCouponUseCase deleteCouponUseCase;

    public CouponController(ValidateCouponUseCase validateCouponUseCase,
                             ListCouponsUseCase listCouponsUseCase,
                             CreateCouponUseCase createCouponUseCase,
                             DeleteCouponUseCase deleteCouponUseCase) {
        this.validateCouponUseCase = validateCouponUseCase;
        this.listCouponsUseCase = listCouponsUseCase;
        this.createCouponUseCase = createCouponUseCase;
        this.deleteCouponUseCase = deleteCouponUseCase;
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

    @Operation(operationId = "listCoupons", summary = "List all coupons (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Coupons listed",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = AdminCouponDto.class))))
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminCouponDto>> listAll() {
        return ResponseEntity.ok(listCouponsUseCase.execute());
    }

    @Operation(operationId = "createCoupon", summary = "Create a coupon (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Coupon created",
            content = @Content(schema = @Schema(implementation = AdminCouponDto.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminCouponDto> create(@Valid @RequestBody CreateCouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(createCouponUseCase.execute(request));
    }

    @Operation(operationId = "deleteCoupon", summary = "Delete a coupon (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "204", description = "Coupon deleted")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        deleteCouponUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
