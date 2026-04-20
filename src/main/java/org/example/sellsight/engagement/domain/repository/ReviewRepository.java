package org.example.sellsight.engagement.domain.repository;

import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.model.ReviewId;

import java.util.List;
import java.util.Optional;

/** Outbound port for review persistence. */
public interface ReviewRepository {
    Review save(Review review);
    Optional<Review> findById(ReviewId id);
    List<Review> findByProductId(String productId);
    Optional<Review> findByProductIdAndCustomerId(String productId, String customerId);
    boolean existsByProductIdAndCustomerId(String productId, String customerId);
    void deleteById(ReviewId id);
}
