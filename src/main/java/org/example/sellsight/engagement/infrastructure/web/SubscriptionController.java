package org.example.sellsight.engagement.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.usecase.ManageBackInStockSubscriptionUseCase;
import org.example.sellsight.engagement.application.usecase.ManagePriceDropSubscriptionUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Tag(name = "Subscriptions", description = "Price drop and back-in-stock alert subscriptions")
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final ManagePriceDropSubscriptionUseCase priceDropUseCase;
    private final ManageBackInStockSubscriptionUseCase backInStockUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public SubscriptionController(ManagePriceDropSubscriptionUseCase priceDropUseCase,
                                   ManageBackInStockSubscriptionUseCase backInStockUseCase,
                                   GetUserProfileUseCase getUserProfileUseCase) {
        this.priceDropUseCase = priceDropUseCase;
        this.backInStockUseCase = backInStockUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "subscribePriceDrop", summary = "Subscribe to price drop alerts",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/price-drop/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> subscribePriceDrop(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") BigDecimal targetPrice,
            Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        priceDropUseCase.subscribe(user.id(), productId, targetPrice);
        return ResponseEntity.ok().build();
    }

    @Operation(operationId = "unsubscribePriceDrop", summary = "Unsubscribe from price drop alerts",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/price-drop/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unsubscribePriceDrop(@PathVariable String productId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        priceDropUseCase.unsubscribe(user.id(), productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "checkPriceDropSubscription", summary = "Check if subscribed to price drop",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/price-drop/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkPriceDrop(@PathVariable String productId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        boolean subscribed = priceDropUseCase.isSubscribed(user.id(), productId);
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }

    // ── Back-in-stock ──────────────────────────────────────────

    @Operation(operationId = "subscribeBackInStock", summary = "Subscribe to back-in-stock alerts",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/back-in-stock/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> subscribeBackInStock(@PathVariable String productId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        backInStockUseCase.subscribe(user.id(), productId);
        return ResponseEntity.ok().build();
    }

    @Operation(operationId = "unsubscribeBackInStock", summary = "Unsubscribe from back-in-stock alerts",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/back-in-stock/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unsubscribeBackInStock(@PathVariable String productId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        backInStockUseCase.unsubscribe(user.id(), productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "checkBackInStockSubscription", summary = "Check if subscribed to back-in-stock alerts",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/back-in-stock/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkBackInStock(@PathVariable String productId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        boolean subscribed = backInStockUseCase.isSubscribed(user.id(), productId);
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }
}
