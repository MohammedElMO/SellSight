package org.example.sellsight.cart.infrastructure.persistence.repository;

import org.example.sellsight.cart.infrastructure.persistence.entity.CartJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartJpaRepository extends JpaRepository<CartJpaEntity, UUID> {
    Optional<CartJpaEntity> findByUserId(String userId);
    void deleteByUserId(String userId);

    @Modifying
    @Query(value = "INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (:id, :userId, :createdAt, NOW()) ON CONFLICT (user_id) DO NOTHING", nativeQuery = true)
    void insertIfAbsent(@Param("id") UUID id, @Param("userId") String userId, @Param("createdAt") LocalDateTime createdAt);
}
