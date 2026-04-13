package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.persistence.mapper.ProductPersistenceMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter implementing the domain ProductRepository port.
 */
@Component
public class ProductRepositoryAdapter implements ProductRepository {

    private final ProductJpaRepository jpaRepository;

    public ProductRepositoryAdapter(ProductJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Product save(Product product) {
        var entity = ProductPersistenceMapper.toJpa(product);
        var saved = jpaRepository.save(entity);
        return ProductPersistenceMapper.toDomain(saved);
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return jpaRepository.findById(id.getValue())
                .map(ProductPersistenceMapper::toDomain);
    }

    @Override
    public List<Product> findAll(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jpaRepository.findByActiveTrue(pageable)
                .map(ProductPersistenceMapper::toDomain)
                .getContent();
    }

    @Override
    public List<Product> findBySellerId(String sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jpaRepository.findBySellerIdAndActiveTrue(sellerId, pageable)
                .map(ProductPersistenceMapper::toDomain)
                .getContent();
    }

    @Override
    public List<Product> findByCategory(String category, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jpaRepository.findByCategoryAndActiveTrue(category, pageable)
                .map(ProductPersistenceMapper::toDomain)
                .getContent();
    }

    @Override
    public long count() {
        return jpaRepository.countByActiveTrue();
    }

    @Override
    public long countBySellerId(String sellerId) {
        return jpaRepository.countBySellerIdAndActiveTrue(sellerId);
    }

    @Override
    public void deleteById(ProductId id) {
        jpaRepository.deleteById(id.getValue());
    }

    @Override
    public boolean existsById(ProductId id) {
        return jpaRepository.existsById(id.getValue());
    }
}
