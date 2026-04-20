package org.example.sellsight.cart.domain.repository;

import org.example.sellsight.cart.domain.model.Cart;

import java.util.Optional;

public interface CartRepository {
    Optional<Cart> findByUserId(String userId);
    Cart save(Cart cart);
    void deleteByUserId(String userId);
}
