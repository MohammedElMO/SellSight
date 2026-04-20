package org.example.sellsight.engagement.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.application.usecase.CreateWishlistUseCase;
import org.example.sellsight.engagement.application.usecase.GetWishlistsUseCase;
import org.example.sellsight.engagement.application.usecase.ManageWishlistItemUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Wishlists", description = "Manage named product wishlists")
@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {

    private final CreateWishlistUseCase createWishlistUseCase;
    private final GetWishlistsUseCase getWishlistsUseCase;
    private final ManageWishlistItemUseCase manageItemUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public WishlistController(CreateWishlistUseCase createWishlistUseCase,
                               GetWishlistsUseCase getWishlistsUseCase,
                               ManageWishlistItemUseCase manageItemUseCase,
                               GetUserProfileUseCase getUserProfileUseCase) {
        this.createWishlistUseCase = createWishlistUseCase;
        this.getWishlistsUseCase = getWishlistsUseCase;
        this.manageItemUseCase = manageItemUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getWishlists", summary = "Get my wishlists",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<WishlistDto>> getMine(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(getWishlistsUseCase.execute(user.id()));
    }

    @Operation(operationId = "createWishlist", summary = "Create a new wishlist",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WishlistDto> create(@RequestBody Map<String, String> body,
                                               Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(createWishlistUseCase.execute(user.id(), body.getOrDefault("name", "My Wishlist")));
    }

    @Operation(operationId = "addToWishlist", summary = "Add a product to a wishlist",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{wishlistId}/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WishlistDto> addItem(@PathVariable String wishlistId,
                                                @RequestBody Map<String, String> body,
                                                Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(manageItemUseCase.addProduct(wishlistId, body.get("productId"), user.id()));
    }

    @Operation(operationId = "removeFromWishlist", summary = "Remove a product from a wishlist",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{wishlistId}/items/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WishlistDto> removeItem(@PathVariable String wishlistId,
                                                   @PathVariable String productId,
                                                   Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(manageItemUseCase.removeProduct(wishlistId, productId, user.id()));
    }
}
