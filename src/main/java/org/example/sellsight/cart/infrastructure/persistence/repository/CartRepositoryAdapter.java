package org.example.sellsight.cart.infrastructure.persistence.repository;

import org.example.sellsight.cart.domain.model.Cart;
import org.example.sellsight.cart.domain.model.CartItem;
import org.example.sellsight.cart.domain.repository.CartRepository;
import org.example.sellsight.cart.infrastructure.persistence.entity.CartItemJpaEntity;
import org.example.sellsight.cart.infrastructure.persistence.entity.CartJpaEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class CartRepositoryAdapter implements CartRepository {

    private final CartJpaRepository cartJpaRepository;

    public CartRepositoryAdapter(CartJpaRepository cartJpaRepository) {
        this.cartJpaRepository = cartJpaRepository;
    }

    @Override
    public Optional<Cart> findByUserId(String userId) {
        return cartJpaRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public Cart save(Cart cart) {
        CartJpaEntity entity = cartJpaRepository.findByUserId(cart.getUserId())
                .orElseGet(() -> {
                    CartJpaEntity e = new CartJpaEntity(
                            UUID.fromString(cart.getId()),
                            cart.getUserId(),
                            cart.getCreatedAt(),
                            null
                    );
                    return e;
                });

        entity.setUpdatedAt(LocalDateTime.now());

        // Sync items — remove deleted, add/update existing
        entity.getItems().removeIf(existing ->
                cart.getItems().stream()
                        .noneMatch(di -> di.getProductId().equals(existing.getProductId())));

        for (CartItem domainItem : cart.getItems()) {
            entity.getItems().stream()
                    .filter(e -> e.getProductId().equals(domainItem.getProductId()))
                    .findFirst()
                    .ifPresentOrElse(
                            e -> e.setQuantity(domainItem.getQuantity()),
                            () -> {
                                CartItemJpaEntity newItem = new CartItemJpaEntity(
                                        null, entity, domainItem.getProductId(),
                                        domainItem.getQuantity(), domainItem.isSavedForLater(),
                                        domainItem.getAddedAt()
                                );
                                entity.getItems().add(newItem);
                            }
                    );
        }

        CartJpaEntity saved = cartJpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    @Transactional
    public void deleteByUserId(String userId) {
        cartJpaRepository.deleteByUserId(userId);
    }

    private Cart toDomain(CartJpaEntity entity) {
        List<CartItem> items = entity.getItems().stream()
                .map(i -> new CartItem(i.getId(), i.getProductId(), i.getQuantity(),
                        i.isSavedForLater(), i.getAddedAt()))
                .toList();
        return new Cart(entity.getId().toString(), entity.getUserId(), items,
                entity.getCreatedAt(), entity.getUpdatedAt());
    }
}
