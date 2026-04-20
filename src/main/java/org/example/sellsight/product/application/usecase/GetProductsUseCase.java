package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
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
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Use case: Get paginated product listing.
 */
@Slf4j
@Service
public class GetProductsUseCase {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public GetProductsUseCase(ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public ProductPageDto execute(int page, int size) {
        ProductSlice slice = productRepository.findAll(page, size);
        return toPageDto(slice, page, size);
    }

    @Cacheable(
        value = "product-filter-listings",
        key = "T(java.util.Objects).hash(#category,#minPrice,#maxPrice,#minRating,#inStock,#sort,#page,#size)",
        condition = "#page < 5",
        sync = true
    )
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

    @Cacheable(value = "product-listings", key = "#size", condition = "#lastId == null", sync = true)
    public ProductPageDto executeKeyset(String lastId, int size) {
        int fetchSize = size + 1;
        List<Product> products = lastId == null
                ? productRepository.findActiveFirst(fetchSize)
                : productRepository.findActiveBefore(lastId, fetchSize);
        boolean hasMore = products.size() > size;
        List<Product> page = products.stream().limit(size).toList();
        Map<String, Integer> stockMap = stockMapFor(page);
        List<ProductDto> dtos = page.stream().map(p -> toDto(p, stockMap)).toList();
        return new ProductPageDto(dtos, 0, size, hasMore);
    }

    private ProductPageDto toPageDto(ProductSlice slice, int page, int size) {
        List<Product> products = slice.items();
        Map<String, Integer> stockMap = stockMapFor(products);
        List<ProductDto> dtos = products.stream().map(p -> toDto(p, stockMap)).toList();
        return new ProductPageDto(dtos, page, size, slice.hasMore());
    }

    private Map<String, Integer> stockMapFor(List<Product> products) {
        List<String> ids = products.stream().map(p -> p.getId().getValue()).toList();
        return inventoryRepository.findAllByProductIds(ids).stream()
                .collect(Collectors.toMap(InventoryItem::getProductId, i -> i.getStockLevel().getQuantity()));
    }

    private ProductDto toDto(Product p, Map<String, Integer> stockMap) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.getBrand(), p.getRatingAvg(), p.getRatingCount(), p.getSoldCount(),
                p.isActive(), p.getCreatedAt(), p.getUpdatedAt(),
                stockMap.getOrDefault(p.getId().getValue(), 0)
        );
    }
}
