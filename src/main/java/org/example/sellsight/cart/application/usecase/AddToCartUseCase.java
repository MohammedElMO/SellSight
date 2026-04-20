package org.example.sellsight.cart.application.usecase;

import org.example.sellsight.cart.application.dto.CartDto;
import org.example.sellsight.cart.domain.model.Cart;
import org.example.sellsight.cart.domain.repository.CartRepository;
import org.springframework.stereotype.Component;

@Component
public class AddToCartUseCase {

    private final CartRepository cartRepository;
    private final GetCartUseCase getCartUseCase;

    public AddToCartUseCase(CartRepository cartRepository, GetCartUseCase getCartUseCase) {
        this.cartRepository = cartRepository;
        this.getCartUseCase = getCartUseCase;
    }

    public CartDto execute(String userId, String productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.empty(userId));
        cart.addOrUpdateItem(productId, quantity);
        Cart saved = cartRepository.save(cart);
        return getCartUseCase.toDto(saved);
    }
}
