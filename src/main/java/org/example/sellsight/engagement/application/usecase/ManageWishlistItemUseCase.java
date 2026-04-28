package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ManageWishlistItemUseCase {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public ManageWishlistItemUseCase(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    public WishlistDto addProduct(String wishlistId, String productId, String userId) {
        Wishlist wishlist = wishlistRepository.findById(WishlistId.of(java.util.UUID.fromString(wishlistId)))
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

        if (!wishlist.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied to this wishlist");
        }

        wishlist.addProduct(productId);
        Wishlist saved = wishlistRepository.save(wishlist);
        return CreateWishlistUseCase.toDto(saved, buildProductMap(saved));
    }

    public WishlistDto removeProduct(String wishlistId, String productId, String userId) {
        Wishlist wishlist = wishlistRepository.findById(WishlistId.of(java.util.UUID.fromString(wishlistId)))
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

        if (!wishlist.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied to this wishlist");
        }

        wishlist.removeProduct(productId);
        Wishlist saved = wishlistRepository.save(wishlist);
        return CreateWishlistUseCase.toDto(saved, buildProductMap(saved));
    }

    private Map<String, Product> buildProductMap(Wishlist wishlist) {
        return wishlist.getItems().stream()
                .flatMap(i -> productRepository.findById(ProductId.from(i.productId())).stream())
                .collect(Collectors.toMap(p -> p.getId().getValue(), p -> p));
    }
}
