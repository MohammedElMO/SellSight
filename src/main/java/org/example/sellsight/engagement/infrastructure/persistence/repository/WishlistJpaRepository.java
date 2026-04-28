package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistJpaRepository extends JpaRepository<WishlistJpaEntity, UUID> {
    List<WishlistJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<WishlistJpaEntity> findByUserIdAndIsDefaultTrue(String userId);

    @Modifying
    @Query("UPDATE WishlistJpaEntity w SET w.isDefault = false WHERE w.userId = :userId")
    void clearDefaultByUserId(@Param("userId") String userId);
}
