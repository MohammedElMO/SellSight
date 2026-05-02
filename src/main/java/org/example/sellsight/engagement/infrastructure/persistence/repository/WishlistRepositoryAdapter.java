package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.repository.WishlistRepository;
import org.example.sellsight.engagement.infrastructure.persistence.mapper.WishlistPersistenceMapper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
public class WishlistRepositoryAdapter implements WishlistRepository {

    private final WishlistJpaRepository jpa;
    private final WishlistPersistenceMapper mapper;

    public WishlistRepositoryAdapter(WishlistJpaRepository jpa, WishlistPersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Wishlist save(Wishlist wishlist) {
        return mapper.toDomain(jpa.save(mapper.toJpa(wishlist)));
    }

    @Override
    public Optional<Wishlist> findById(WishlistId id) {
        return jpa.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<Wishlist> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Wishlist> findDefaultByUserId(String userId) {
        return jpa.findByUserIdAndIsDefaultTrue(userId).map(mapper::toDomain);
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
}
