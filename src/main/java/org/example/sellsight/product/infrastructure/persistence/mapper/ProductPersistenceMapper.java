package org.example.sellsight.product.infrastructure.persistence.mapper;

import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;

/**
 * Maps between domain Product and JPA ProductJpaEntity.
 */
public final class ProductPersistenceMapper {

    private ProductPersistenceMapper() {}

    public static Product toDomain(ProductJpaEntity entity) {
        return new Product(
                ProductId.from(entity.getId()),
                entity.getName(),
                entity.getDescription(),
                new Money(entity.getPrice()),
                entity.getCategory(),
                entity.getSellerId(),
                entity.getImageUrl(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static ProductJpaEntity toJpa(Product product) {
        return new ProductJpaEntity(
                product.getId().getValue(),
                product.getName(),
                product.getDescription(),
                product.getPrice().getAmount(),
                product.getCategory(),
                product.getSellerId(),
                product.getImageUrl(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
