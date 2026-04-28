package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.model.WishlistItem;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistItemJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistJpaEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
public class WishlistRepositoryAdapter implements WishlistRepository {

    private final WishlistJpaRepository jpa;

    public WishlistRepositoryAdapter(WishlistJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Wishlist save(Wishlist wishlist) {
        var entity = toJpa(wishlist);
        var saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Wishlist> findById(WishlistId id) {
        return jpa.findById(id.value()).map(this::toDomain);
    }

    @Override
    public List<Wishlist> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<Wishlist> findDefaultByUserId(String userId) {
        return jpa.findByUserIdAndIsDefaultTrue(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public void clearDefaultForUser(String userId) {
        jpa.clearDefaultByUserId(userId);
    }

    @Override
    public void deleteById(WishlistId id) {
        jpa.deleteById(id.value());
    }

    private WishlistJpaEntity toJpa(Wishlist w) {
        var e = new WishlistJpaEntity();
        e.setId(w.getId().value());
        e.setUserId(w.getUserId());
        e.setName(w.getName());
        e.setDefault(w.isDefault());
        e.setCreatedAt(w.getCreatedAt());

        var items = w.getItems().stream().map(item -> {
            var ie = new WishlistItemJpaEntity();
            ie.setId(item.id());
            ie.setWishlist(e);
            ie.setProductId(item.productId());
            ie.setAddedAt(item.addedAt());
            return ie;
        }).toList();
        e.setItems(new java.util.ArrayList<>(items));
        return e;
    }

    private Wishlist toDomain(WishlistJpaEntity e) {
        var items = e.getItems().stream()
                .map(i -> new WishlistItem(i.getId(), i.getProductId(), i.getAddedAt()))
                .toList();
        return new Wishlist(
                WishlistId.of(e.getId()),
                e.getUserId(),
                e.getName(),
                e.isDefault(),
                items,
                e.getCreatedAt()
        );
    }
}
