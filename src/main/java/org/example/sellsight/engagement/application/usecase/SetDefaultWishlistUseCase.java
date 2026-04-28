package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class SetDefaultWishlistUseCase {

    private final WishlistRepository wishlistRepository;

    public SetDefaultWishlistUseCase(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    @Transactional
    public WishlistDto execute(String wishlistId, String userId) {
        Wishlist wishlist = wishlistRepository.findById(WishlistId.of(UUID.fromString(wishlistId)))
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

        if (!wishlist.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied to this wishlist");
        }

        wishlistRepository.clearDefaultForUser(userId);
        wishlist.markAsDefault();
        Wishlist saved = wishlistRepository.save(wishlist);
        return CreateWishlistUseCase.toDto(saved, Map.of());
    }
}
