package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.WishlistDto;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class GetWishlistsUseCase {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public GetWishlistsUseCase(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    public List<WishlistDto> execute(String userId) {
        var wishlists = wishlistRepository.findByUserId(userId);

        var productIds = wishlists.stream()
                .flatMap(wl -> wl.getItems().stream().map(i -> i.productId()))
                .collect(Collectors.toSet());

        Map<String, Product> products = productIds.stream()
                .flatMap(id -> productRepository.findById(ProductId.from(id)).stream())
                .collect(Collectors.toMap(p -> p.getId().getValue(), p -> p));

        return wishlists.stream()
                .map(wl -> CreateWishlistUseCase.toDto(wl, products))
                .toList();
    }
}
