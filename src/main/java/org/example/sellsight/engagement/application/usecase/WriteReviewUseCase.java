package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.CreateReviewRequest;
import org.example.sellsight.engagement.application.dto.ReviewDto;
import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.model.ReviewId;
import org.example.sellsight.engagement.domain.repository.ReviewRepository;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Creates a product review. Enforces:
 * - one review per customer per product
 * - verified purchase check (customer has a DELIVERED order containing the product)
 */
@Slf4j
@Component
public class WriteReviewUseCase {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public WriteReviewUseCase(ReviewRepository reviewRepository,
                              OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    public ReviewDto execute(CreateReviewRequest request, String customerId) {
        if (reviewRepository.existsByProductIdAndCustomerId(request.productId(), customerId)) {
            throw new IllegalStateException("You have already reviewed this product");
        }

        boolean verified = orderRepository.hasDeliveredOrderWithProduct(customerId, request.productId());

        Review review = new Review(
                ReviewId.generate(),
                request.productId(),
                customerId,
                request.rating(),
                request.title(),
                request.body(),
                verified,
                0,
                LocalDateTime.now(),
                null
        );

        Review saved = reviewRepository.save(review);

        return toDto(saved, List.of(), "", "");
    }

    static ReviewDto toDto(Review r, List<String> imageUrls,
                            String firstName, String lastName) {
        return new ReviewDto(
                r.getId().value().toString(),
                r.getProductId(),
                r.getCustomerId(),
                firstName,
                lastName,
                r.getRating(),
                r.getTitle(),
                r.getBody(),
                r.isVerifiedPurchase(),
                r.getHelpfulCount(),
                r.getCreatedAt(),
                r.getUpdatedAt(),
                imageUrls
        );
    }
}
