package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.model.ProductSlice;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.example.sellsight.product.infrastructure.persistence.mapper.ProductPersistenceMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
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
    public ProductSlice findAll(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toProductSlice(jpaRepository.findByActiveTrue(pageable));
    }

    @Override
    public ProductSlice findBySellerId(String sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toProductSlice(jpaRepository.findBySellerIdAndActiveTrue(sellerId, pageable));
    }

    @Override
    public ProductSlice findByCategory(String category, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toProductSlice(jpaRepository.findByCategoryAndActiveTrue(category, pageable));
    }

    @Override
    public ProductSlice search(String query, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return toProductSlice(jpaRepository.searchByFullText(query, pageable));
    }

    @Override
    public ProductSlice findWithFilters(
            String category, BigDecimal minPrice, BigDecimal maxPrice,
            Double minRating, Boolean inStock, String sort, int page, int size) {

        var pageable = PageRequest.of(page, size, resolveSort(sort));
        var spec = ProductSpec.withFilters(category, minPrice, maxPrice, minRating, inStock);
        return toProductSlice(jpaRepository.findAllSliced(spec, pageable));
    }

    @Override
    public List<Product> findActiveFirst(int size) {
        return jpaRepository.findActiveFirst(size).stream()
                .map(ProductPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public List<Product> findActiveBefore(String lastId, int size) {
        return jpaRepository.findActiveBefore(lastId, size).stream()
                .map(ProductPersistenceMapper::toDomain)
                .toList();
    }

    private ProductSlice toProductSlice(Page<ProductJpaEntity> page) {
        List<Product> items = page.getContent().stream()
                .map(ProductPersistenceMapper::toDomain)
                .toList();
        return new ProductSlice(items, page.hasNext(), page.getTotalElements());
    }

    private Sort resolveSort(String sort) {
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        if (sort == null) return defaultSort;
        return switch (sort) {
            case "price_asc"    -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
            case "price_desc"   -> Sort.by(Sort.Direction.DESC, "price", "id");
            case "rating"       -> Sort.by(Sort.Direction.DESC, "ratingAvg", "id");
            case "best_selling" -> Sort.by(Sort.Direction.DESC, "soldCount", "id");
            default             -> defaultSort;
        };
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
