package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.ReviewDto;
import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.repository.ReviewRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Retrieves all reviews for a given product.
 */
@Slf4j
@Component
public class GetProductReviewsUseCase {

    private final ReviewRepository reviewRepository;

    public GetProductReviewsUseCase(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<ReviewDto> execute(String productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(r -> WriteReviewUseCase.toDto(r, List.of(), "", ""))
                .toList();
    }
}
