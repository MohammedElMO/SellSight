package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Create a new named wishlist for a user.
 */
@Component
public class CreateWishlistUseCase {

    private final WishlistRepository wishlistRepository;

    public CreateWishlistUseCase(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public WishlistDto execute(String userId, String name) {
        Wishlist wishlist = new Wishlist(
                WishlistId.generate(),
                userId,
                name != null && !name.isBlank() ? name : "My Wishlist",
                List.of(),
                LocalDateTime.now()
        );
        Wishlist saved = wishlistRepository.save(wishlist);
        return toDto(saved);
    }

    static WishlistDto toDto(Wishlist w) {
        return new WishlistDto(
                w.getId().value().toString(),
                w.getUserId(),
                w.getName(),
                w.getItems().stream().map(i -> new WishlistDto.WishlistItemDto(
                        i.id(), i.productId(), "", "", 0.0, i.addedAt()
                )).toList(),
                w.getCreatedAt()
        );
    }
}
