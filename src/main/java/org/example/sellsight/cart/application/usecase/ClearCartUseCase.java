package org.example.sellsight.cart.application.usecase;

import org.example.sellsight.cart.domain.repository.CartRepository;
import org.springframework.stereotype.Component;

@Component
public class ClearCartUseCase {

    private final CartRepository cartRepository;

    public ClearCartUseCase(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public void execute(String userId) {
        cartRepository.deleteByUserId(userId);
    }
}
