package org.example.sellsight.product.domain.repository;

import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;

import java.util.Optional;

/**
 * Port interface for Product persistence.
 */
public interface ProductRepository {

    Product save(Product product);

    Optional<Product> findById(ProductId id);

    java.util.List<Product> findAll(int page, int size);

    java.util.List<Product> findBySellerId(String sellerId, int page, int size);

    java.util.List<Product> findByCategory(String category, int page, int size);

    long count();

    long countBySellerId(String sellerId);

    void deleteById(ProductId id);

    boolean existsById(ProductId id);
}
