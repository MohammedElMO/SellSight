package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewVoteJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.repository.ReviewVoteJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class VoteReviewUseCase {

    private final ReviewVoteJpaRepository voteRepo;

    public VoteReviewUseCase(ReviewVoteJpaRepository voteRepo) {
        this.voteRepo = voteRepo;
    }

    @Transactional
    public void voteHelpful(String reviewId, String userId) {
        UUID reviewUuid = UUID.fromString(reviewId);
        if (voteRepo.existsByReviewIdAndUserId(reviewUuid, userId)) {
            throw new IllegalStateException("Already voted on this review");
        }
        voteRepo.save(new ReviewVoteJpaEntity(reviewUuid, userId, true));
        voteRepo.incrementHelpful(reviewUuid);
    }
}
