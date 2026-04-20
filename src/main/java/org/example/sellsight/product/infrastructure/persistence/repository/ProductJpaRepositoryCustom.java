package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

interface ProductJpaRepositoryCustom {
    Page<ProductJpaEntity> findAllSliced(Specification<ProductJpaEntity> spec, Pageable pageable);
}
