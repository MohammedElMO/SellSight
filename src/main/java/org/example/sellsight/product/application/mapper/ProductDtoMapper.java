package org.example.sellsight.product.application.mapper;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductDtoMapper {

    @Mapping(target = "id", expression = "java(p.getId().getValue())")
    @Mapping(target = "price", expression = "java(p.getPrice().getAmount())")
    @Mapping(target = "stockQuantity", expression = "java(stockQuantity)")
    ProductDto toDto(Product p, int stockQuantity);
}
