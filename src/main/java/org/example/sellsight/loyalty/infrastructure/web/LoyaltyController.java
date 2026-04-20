package org.example.sellsight.loyalty.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.loyalty.application.dto.LoyaltyAccountDto;
import org.example.sellsight.loyalty.application.usecase.GetLoyaltyAccountUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Loyalty", description = "Points, tiers, and referrals")
@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private final GetLoyaltyAccountUseCase loyaltyUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public LoyaltyController(GetLoyaltyAccountUseCase loyaltyUseCase,
                              GetUserProfileUseCase getUserProfileUseCase) {
        this.loyaltyUseCase = loyaltyUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getLoyaltyAccount", summary = "Get my loyalty account",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<LoyaltyAccountDto> getAccount(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(loyaltyUseCase.execute(user.id()));
    }

    @Operation(operationId = "redeemPoints", summary = "Redeem loyalty points",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<LoyaltyAccountDto> redeem(@RequestBody Map<String, Object> body,
                                                     Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        int points = Integer.parseInt(body.get("points").toString());
        String orderId = body.getOrDefault("orderId", "").toString();
        return ResponseEntity.ok(loyaltyUseCase.redeemPoints(user.id(), points, orderId));
    }
}
