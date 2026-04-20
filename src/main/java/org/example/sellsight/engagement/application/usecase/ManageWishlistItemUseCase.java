package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Add or remove a product from a wishlist.
 */
@Component
public class ManageWishlistItemUseCase {

    private final WishlistRepository wishlistRepository;

    public ManageWishlistItemUseCase(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public WishlistDto addProduct(String wishlistId, String productId, String userId) {
        Wishlist wishlist = wishlistRepository.findById(WishlistId.of(UUID.fromString(wishlistId)))
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

        if (!wishlist.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied to this wishlist");
        }

        wishlist.addProduct(productId);
        Wishlist saved = wishlistRepository.save(wishlist);
        return CreateWishlistUseCase.toDto(saved);
    }

    public WishlistDto removeProduct(String wishlistId, String productId, String userId) {
        Wishlist wishlist = wishlistRepository.findById(WishlistId.of(UUID.fromString(wishlistId)))
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

        if (!wishlist.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied to this wishlist");
        }

        wishlist.removeProduct(productId);
        Wishlist saved = wishlistRepository.save(wishlist);
        return CreateWishlistUseCase.toDto(saved);
    }
}
