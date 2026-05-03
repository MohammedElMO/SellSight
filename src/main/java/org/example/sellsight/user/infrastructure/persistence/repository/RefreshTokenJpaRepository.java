package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.infrastructure.persistence.entity.RefreshTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenJpaEntity, UUID> {

    Optional<RefreshTokenJpaEntity> findByTokenHash(String tokenHash);

    List<RefreshTokenJpaEntity> findByUserId(String userId);

    @Query("SELECT r FROM RefreshTokenJpaEntity r WHERE r.userId = :userId AND r.revokedAt IS NULL AND r.expiresAt > CURRENT_TIMESTAMP")
    List<RefreshTokenJpaEntity> findActiveByUserId(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revokedAt = CURRENT_TIMESTAMP WHERE r.userId = :userId AND r.revokedAt IS NULL")
    void revokeAllByUserId(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revokedAt = CURRENT_TIMESTAMP WHERE r.tokenFamilyId = :familyId AND r.revokedAt IS NULL")
    void revokeAllByFamilyId(@Param("familyId") UUID familyId);
}
