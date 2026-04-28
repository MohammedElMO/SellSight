package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.example.sellsight.product.domain.model.Product;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
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
                false,
                List.of(),
                LocalDateTime.now()
        );
        Wishlist saved = wishlistRepository.save(wishlist);
        return toDto(saved, Map.of());
    }

    /**
     * @param products map of productId → Product for enriching item details; missing IDs use fallback zeros
     */
    static WishlistDto toDto(Wishlist w, Map<String, Product> products) {
        return new WishlistDto(
                w.getId().value().toString(),
                w.getUserId(),
                w.getName(),
                w.isDefault(),
                w.getItems().stream().<WishlistDto.WishlistItemDto>map(i -> {
                    Product p = products.get(i.productId());
                    String name = p != null ? p.getName() : "";
                    String imageUrl = p != null ? p.getImageUrl() : "";
                    double price = p != null ? p.getPrice().getAmount().doubleValue() : 0.0;
                    return new WishlistDto.WishlistItemDto(i.id(), i.productId(), name, imageUrl, price, i.addedAt());
                }).toList(),
                w.getCreatedAt()
        );
    }
}
