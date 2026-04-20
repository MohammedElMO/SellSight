package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Get all wishlists for the authenticated user.
 */
@Component
public class GetWishlistsUseCase {

    private final WishlistRepository wishlistRepository;

    public GetWishlistsUseCase(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public List<WishlistDto> execute(String userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(CreateWishlistUseCase::toDto)
                .toList();
    }
}
