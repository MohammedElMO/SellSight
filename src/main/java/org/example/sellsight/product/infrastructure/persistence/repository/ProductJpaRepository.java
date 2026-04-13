package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for ProductJpaEntity.
 */
@Repository
public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, String> {

    Page<ProductJpaEntity> findByActiveTrue(Pageable pageable);

    Page<ProductJpaEntity> findBySellerIdAndActiveTrue(String sellerId, Pageable pageable);

    Page<ProductJpaEntity> findByCategoryAndActiveTrue(String category, Pageable pageable);

    long countByActiveTrue();

    long countBySellerIdAndActiveTrue(String sellerId);
}
