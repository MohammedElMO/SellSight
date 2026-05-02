package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Review;
import org.example.sellsight.engagement.domain.model.ReviewId;
import org.example.sellsight.engagement.domain.repository.ReviewRepository;
import org.example.sellsight.engagement.infrastructure.persistence.mapper.ReviewPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ReviewRepositoryAdapter implements ReviewRepository {

    private final ReviewJpaRepository jpa;
    private final ReviewPersistenceMapper mapper;

    public ReviewRepositoryAdapter(ReviewJpaRepository jpa, ReviewPersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Review save(Review review) {
        return mapper.toDomain(jpa.save(mapper.toJpa(review)));
    }

    @Override
    public Optional<Review> findById(ReviewId id) {
        return jpa.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<Review> findByProductId(String productId) {
        return jpa.findByProductIdOrderByCreatedAtDesc(productId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Review> findByProductIdAndCustomerId(String productId, String customerId) {
        return jpa.findByProductIdAndCustomerId(productId, customerId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByProductIdAndCustomerId(String productId, String customerId) {
        return jpa.existsByProductIdAndCustomerId(productId, customerId);
    }

    @Override
    public void deleteById(ReviewId id) {
        jpa.deleteById(id.value());
    }
}
