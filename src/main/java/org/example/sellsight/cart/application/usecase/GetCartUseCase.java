package org.example.sellsight.cart.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.cart.application.dto.CartDto;
import org.example.sellsight.cart.domain.model.Cart;
import org.example.sellsight.cart.domain.model.CartItem;
import org.example.sellsight.cart.domain.repository.CartRepository;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
public class GetCartUseCase {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public GetCartUseCase(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public CartDto execute(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.empty(userId));
        return toDto(cart);
    }

    CartDto toDto(Cart cart) {
        List<CartDto.CartItemDto> itemDtos = cart.getItems().stream()
                .map(item -> enrichItem(item))
                .toList();
        return new CartDto(cart.getId(), cart.getUserId(), itemDtos);
    }

    private CartDto.CartItemDto enrichItem(CartItem item) {
        Optional<Product> product = productRepository.findById(ProductId.from(item.getProductId()));
        String name = product.map(Product::getName).orElse("Unknown product");
        String imageUrl = product.map(Product::getImageUrl).orElse(null);
        BigDecimal price = product.map(p -> p.getPrice().getAmount()).orElse(BigDecimal.ZERO);
        return new CartDto.CartItemDto(
                item.getId(), item.getProductId(), name, imageUrl,
                price, item.getQuantity(), item.isSavedForLater(), item.getAddedAt()
        );
    }
}
