package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.ProductPageDto;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductSlice;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Use case: Get paginated product listing.
 */
@Service
public class GetProductsUseCase {

    private final ProductRepository productRepository;

    public GetProductsUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ProductPageDto execute(int page, int size) {
        ProductSlice slice = productRepository.findAll(page, size);
        return toPageDto(slice, page, size);
    }

    @Cacheable(
        value = "product-filter-listings",
        key = "T(java.util.Objects).hash(#category,#minPrice,#maxPrice,#minRating,#inStock,#sort,#page,#size)",
        condition = "#page < 5"
    )
    @Transactional(readOnly = true)
    public ProductPageDto executeWithFilters(
            String category, BigDecimal minPrice, BigDecimal maxPrice,
            Double minRating, Boolean inStock, String sort, int page, int size) {

        ProductSlice slice = productRepository.findWithFilters(
                category, minPrice, maxPrice, minRating, inStock, sort, page, size);
        return toPageDto(slice, page, size);
    }

    @Transactional(readOnly = true)
    public ProductPageDto executeBySeller(String sellerId, int page, int size) {
        ProductSlice slice = productRepository.findBySellerId(sellerId, page, size);
        return toPageDto(slice, page, size);
    }

    @Cacheable(value = "product-listings", key = "#size", condition = "#lastId == null")
    @Transactional(readOnly = true)
    public ProductPageDto executeKeyset(String lastId, int size) {
        // Request size+1 to determine hasMore without a COUNT query
        int fetchSize = size + 1;
        List<Product> products = lastId == null
                ? productRepository.findActiveFirst(fetchSize)
                : productRepository.findActiveBefore(lastId, fetchSize);
        boolean hasMore = products.size() > size;
        List<ProductDto> dtos = products.stream()
                .limit(size)
                .map(this::toDto)
                .toList();
        return new ProductPageDto(dtos, 0, size, hasMore);
    }

    private ProductPageDto toPageDto(ProductSlice slice, int page, int size) {
        List<ProductDto> dtos = slice.items().stream().map(this::toDto).toList();
        return new ProductPageDto(dtos, page, size, slice.hasMore());
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.getBrand(), p.getRatingAvg(), p.getRatingCount(), p.getSoldCount(),
                p.isActive(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
