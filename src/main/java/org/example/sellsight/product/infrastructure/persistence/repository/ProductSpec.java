package org.example.sellsight.product.infrastructure.persistence.repository;

import jakarta.persistence.criteria.Predicate;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

final class ProductSpec {

    private ProductSpec() {}

    static Specification<ProductJpaEntity> withFilters(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            Boolean inStock) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("active")));

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.<BigDecimal>get("ratingAvg"),
                        BigDecimal.valueOf(minRating)));
            }

            if (inStock != null && inStock) {
                // EXISTS short-circuits on first match — faster than scalar subquery.
                var sub = query.subquery(Integer.class);
                var invRoot = sub.from(org.example.sellsight.inventory.infrastructure.persistence.entity.InventoryJpaEntity.class);
                sub.select(cb.literal(1));
                sub.where(
                    cb.equal(invRoot.get("productId"), root.get("id")),
                    cb.greaterThan(invRoot.<Integer>get("quantity"), 0)
                );
                predicates.add(cb.exists(sub));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
