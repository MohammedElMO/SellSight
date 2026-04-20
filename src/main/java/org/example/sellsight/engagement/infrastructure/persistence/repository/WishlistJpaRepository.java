package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WishlistJpaRepository extends JpaRepository<WishlistJpaEntity, UUID> {
    List<WishlistJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
