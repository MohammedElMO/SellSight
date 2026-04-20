package org.example.sellsight.cart.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.cart.domain.repository.CartRepository;
import org.springframework.stereotype.Component;

@Slf4j
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
