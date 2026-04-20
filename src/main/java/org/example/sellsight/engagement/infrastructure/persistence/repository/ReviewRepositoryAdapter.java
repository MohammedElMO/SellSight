package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.model.ReviewId;
import org.example.sellsight.engagement.domain.repository.ReviewRepository;
import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewImageJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ReviewRepositoryAdapter implements ReviewRepository {

    private final ReviewJpaRepository jpa;

    public ReviewRepositoryAdapter(ReviewJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Review save(Review review) {
        var entity = toJpa(review);
        var saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Review> findById(ReviewId id) {
        return jpa.findById(id.value()).map(this::toDomain);
    }

    @Override
    public List<Review> findByProductId(String productId) {
        return jpa.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<Review> findByProductIdAndCustomerId(String productId, String customerId) {
        return jpa.findByProductIdAndCustomerId(productId, customerId).map(this::toDomain);
    }

    @Override
    public boolean existsByProductIdAndCustomerId(String productId, String customerId) {
        return jpa.existsByProductIdAndCustomerId(productId, customerId);
    }

    @Override
    public void deleteById(ReviewId id) {
        jpa.deleteById(id.value());
    }

    // ── Mapping ─────────────────────────────────────────────

    private ReviewJpaEntity toJpa(Review r) {
        var e = new ReviewJpaEntity();
        e.setId(r.getId().value());
        e.setProductId(r.getProductId());
        e.setCustomerId(r.getCustomerId());
        e.setRating(r.getRating());
        e.setTitle(r.getTitle());
        e.setBody(r.getBody());
        e.setVerifiedPurchase(r.isVerifiedPurchase());
        e.setHelpfulCount(r.getHelpfulCount());
        e.setCreatedAt(r.getCreatedAt());
        e.setUpdatedAt(r.getUpdatedAt());
        return e;
    }

    private Review toDomain(ReviewJpaEntity e) {
        return new Review(
                ReviewId.of(e.getId()),
                e.getProductId(),
                e.getCustomerId(),
                e.getRating(),
                e.getTitle(),
                e.getBody(),
                e.isVerifiedPurchase(),
                e.getHelpfulCount(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
