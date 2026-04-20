package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.domain.Specification;

interface ProductJpaRepositoryCustom {
    Slice<ProductJpaEntity> findAllSliced(Specification<ProductJpaEntity> spec, Pageable pageable);
}
