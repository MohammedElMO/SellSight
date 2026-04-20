package org.example.sellsight.cart.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.cart.application.dto.AddToCartRequest;
import org.example.sellsight.cart.application.dto.CartDto;
import org.example.sellsight.cart.application.dto.UpdateCartItemRequest;
import org.example.sellsight.cart.application.usecase.*;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Cart", description = "Persistent shopping cart for authenticated customers")
@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER')")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final GetCartUseCase getCartUseCase;
    private final AddToCartUseCase addToCartUseCase;
    private final UpdateCartItemUseCase updateCartItemUseCase;
    private final RemoveFromCartUseCase removeFromCartUseCase;
    private final ClearCartUseCase clearCartUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public CartController(GetCartUseCase getCartUseCase,
                          AddToCartUseCase addToCartUseCase,
                          UpdateCartItemUseCase updateCartItemUseCase,
                          RemoveFromCartUseCase removeFromCartUseCase,
                          ClearCartUseCase clearCartUseCase,
                          GetUserProfileUseCase getUserProfileUseCase) {
        this.getCartUseCase = getCartUseCase;
        this.addToCartUseCase = addToCartUseCase;
        this.updateCartItemUseCase = updateCartItemUseCase;
        this.removeFromCartUseCase = removeFromCartUseCase;
        this.clearCartUseCase = clearCartUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getCart", summary = "Get current cart")
    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication auth) {
        return ResponseEntity.ok(getCartUseCase.execute(userId(auth)));
    }

    @Operation(operationId = "addToCart", summary = "Add or increment item in cart")
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(@Valid @RequestBody AddToCartRequest req,
                                            Authentication auth) {
        return ResponseEntity.ok(addToCartUseCase.execute(userId(auth), req.productId(), req.quantity()));
    }

    @Operation(operationId = "updateCartItem", summary = "Set quantity for a cart item")
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDto> updateItem(@PathVariable String productId,
                                               @Valid @RequestBody UpdateCartItemRequest req,
                                               Authentication auth) {
        return ResponseEntity.ok(updateCartItemUseCase.execute(userId(auth), productId, req.quantity()));
    }

    @Operation(operationId = "removeCartItem", summary = "Remove item from cart")
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDto> removeItem(@PathVariable String productId,
                                               Authentication auth) {
        return ResponseEntity.ok(removeFromCartUseCase.execute(userId(auth), productId));
    }

    @Operation(operationId = "clearCart", summary = "Clear entire cart")
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication auth) {
        clearCartUseCase.execute(userId(auth));
        return ResponseEntity.noContent().build();
    }

    private String userId(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return user.id();
    }
}
