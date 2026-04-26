package org.example.sellsight.product.domain.repository;

import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.model.ProductSlice;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Port interface for Product persistence.
 */
public interface ProductRepository {

    Product save(Product product);

    Optional<Product> findById(ProductId id);

    ProductSlice findAll(int page, int size);

    ProductSlice findBySellerId(String sellerId, int page, int size);

    ProductSlice findByCategory(String category, int page, int size);

    ProductSlice search(String query, int page, int size);

    ProductSlice hybridSearch(String query, float[] queryEmbedding, int page, int size);

    ProductSlice findWithFilters(
            String category, BigDecimal minPrice, BigDecimal maxPrice,
            Double minRating, Boolean inStock, String sort, int page, int size);

    List<Product> findActiveFirst(int size);

    List<Product> findActiveBefore(String lastId, int size);

    void deleteById(ProductId id);

    boolean existsById(ProductId id);
}
