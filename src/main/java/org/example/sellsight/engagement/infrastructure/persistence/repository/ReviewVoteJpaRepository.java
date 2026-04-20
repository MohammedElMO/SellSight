package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewVoteJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ReviewVoteJpaRepository
        extends JpaRepository<ReviewVoteJpaEntity, ReviewVoteJpaEntity.PK> {

    boolean existsByReviewIdAndUserId(UUID reviewId, String userId);

    @Modifying
    @Query("UPDATE ReviewJpaEntity r SET r.helpfulCount = r.helpfulCount + 1 WHERE r.id = :reviewId")
    void incrementHelpful(UUID reviewId);
}
