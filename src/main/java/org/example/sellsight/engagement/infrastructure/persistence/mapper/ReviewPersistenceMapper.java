package org.example.sellsight.engagement.infrastructure.persistence.mapper;

import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.model.ReviewId;
import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewPersistenceMapper {

    @Mapping(target = "id", expression = "java(review.getId().value())")
    ReviewJpaEntity toJpa(Review review);

    default Review toDomain(ReviewJpaEntity e) {
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
