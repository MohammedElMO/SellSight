package org.example.sellsight.product.infrastructure.persistence.mapper;

import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductPersistenceMapper {

    @Mapping(target = "id", expression = "java(product.getId().getValue())")
    @Mapping(target = "price", expression = "java(product.getPrice().getAmount())")
    @Mapping(target = "ratingAvg", expression = "java(java.math.BigDecimal.valueOf(product.getRatingAvg()))")
    ProductJpaEntity toJpa(Product product);

    default Product toDomain(ProductJpaEntity e) {
        double ratingAvg = e.getRatingAvg() != null ? e.getRatingAvg().doubleValue() : 0.0;
        return new Product(
                ProductId.from(e.getId()),
                e.getName(),
                e.getDescription(),
                new Money(e.getPrice()),
                e.getCategory(),
                e.getSellerId(),
                e.getImageUrl(),
                e.getBrand(),
                ratingAvg,
                e.getRatingCount(),
                e.getSoldCount(),
                e.isActive(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
