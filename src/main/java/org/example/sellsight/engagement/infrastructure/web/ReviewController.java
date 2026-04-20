package org.example.sellsight.engagement.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.engagement.application.dto.CreateReviewRequest;
import org.example.sellsight.engagement.application.dto.ReviewDto;
import org.example.sellsight.engagement.application.usecase.GetProductReviewsUseCase;
import org.example.sellsight.engagement.application.usecase.VoteReviewUseCase;
import org.example.sellsight.engagement.application.usecase.WriteReviewUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Reviews", description = "Product reviews — write, read, vote")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final WriteReviewUseCase writeReviewUseCase;
    private final GetProductReviewsUseCase getProductReviewsUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;
    private final VoteReviewUseCase voteReviewUseCase;

    public ReviewController(WriteReviewUseCase writeReviewUseCase,
                            GetProductReviewsUseCase getProductReviewsUseCase,
                            GetUserProfileUseCase getUserProfileUseCase,
                            VoteReviewUseCase voteReviewUseCase) {
        this.writeReviewUseCase = writeReviewUseCase;
        this.getProductReviewsUseCase = getProductReviewsUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.voteReviewUseCase = voteReviewUseCase;
    }

    @Operation(operationId = "createReview", summary = "Write a product review",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDto> create(@Valid @RequestBody CreateReviewRequest request,
                                             Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(writeReviewUseCase.execute(request, user.id()));
    }

    @Operation(operationId = "getProductReviews", summary = "Get all reviews for a product")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(getProductReviewsUseCase.execute(productId));
    }

    @Operation(operationId = "voteReviewHelpful", summary = "Vote a review as helpful",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{reviewId}/helpful")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> voteHelpful(@PathVariable String reviewId, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        voteReviewUseCase.voteHelpful(reviewId, user.id());
        return ResponseEntity.ok().build();
    }
}
