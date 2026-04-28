package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.model.ProductSlice;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.example.sellsight.product.infrastructure.persistence.mapper.ProductPersistenceMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter implementing the domain ProductRepository port.
 */
@Component
public class ProductRepositoryAdapter implements ProductRepository {

    private static final String HYBRID_SEARCH_SQL = """
            WITH q AS (
                SELECT CAST(? AS vector) AS vec,
                       websearch_to_tsquery('english', ?) AS ts
            )
            SELECT p.id, p.name, p.description, p.price, p.category, p.seller_id,
                   p.image_url, p.brand, p.rating_avg, p.rating_count, p.sold_count,
                   p.active, p.created_at, p.updated_at
            FROM products p
            CROSS JOIN q
            WHERE p.active = true
              AND (
                (p.embedding IS NOT NULL AND (p.embedding <=> q.vec) < 0.7)
                OR (p.search_vector @@ q.ts)
              )
            ORDER BY
              COALESCE(CASE WHEN p.embedding IS NOT NULL THEN 1.0 - (p.embedding <=> q.vec) ELSE 0.0 END, 0.0) * 0.7
              + COALESCE(ts_rank(p.search_vector, q.ts), 0.0) * 0.3 DESC
            LIMIT ? OFFSET ?
            """;

    private static final String HYBRID_COUNT_SQL = """
            WITH q AS (
                SELECT CAST(? AS vector) AS vec,
                       websearch_to_tsquery('english', ?) AS ts
            )
            SELECT COUNT(*)
            FROM products p
            CROSS JOIN q
            WHERE p.active = true
              AND (
                (p.embedding IS NOT NULL AND (p.embedding <=> q.vec) < 0.7)
                OR (p.search_vector @@ q.ts)
              )
            """;

    private final ProductJpaRepository jpaRepository;
    private final JdbcTemplate jdbcTemplate;

    public ProductRepositoryAdapter(ProductJpaRepository jpaRepository, JdbcTemplate jdbcTemplate) {
        this.jpaRepository = jpaRepository;
        this.jdbcTemplate = jdbcTemplate;
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
        return toProductSlice(jpaRepository.searchByFullText(toOrFtsQuery(query), pageable));
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

    @Override
    public ProductSlice hybridSearch(String query, float[] queryEmbedding, int page, int size) {
        String vectorStr = Arrays.toString(queryEmbedding);
        String ftsQuery = toOrFtsQuery(query);
        int offset = page * size;

        List<Product> products = jdbcTemplate.query(
            HYBRID_SEARCH_SQL,
            (rs, rowNum) -> mapRow(rs),
            vectorStr, ftsQuery, size, offset
        );

        Long total = jdbcTemplate.queryForObject(
            HYBRID_COUNT_SQL,
            Long.class,
            vectorStr, ftsQuery
        );
        long totalElements = total != null ? total : 0L;
        boolean hasMore = (long) (page + 1) * size < totalElements;
        return new ProductSlice(products, hasMore, totalElements);
    }

    /**
     * Converts a raw user query to OR-based websearch_to_tsquery syntax.
     * "im cold" → "im or cold" so products matching ANY word are included.
     * Single words are returned unchanged (AND == OR for one term).
     */
    private static String toOrFtsQuery(String query) {
        return Arrays.stream(query.trim().split("\\s+"))
                .filter(w -> !w.isEmpty())
                .collect(Collectors.joining(" or "));
    }

    private Product mapRow(ResultSet rs) throws SQLException {
        double ratingAvg = rs.getBigDecimal("rating_avg") != null
            ? rs.getBigDecimal("rating_avg").doubleValue() : 0.0;
        return new Product(
            ProductId.from(rs.getString("id")),
            rs.getString("name"),
            rs.getString("description"),
            new Money(rs.getBigDecimal("price")),
            rs.getString("category"),
            rs.getString("seller_id"),
            rs.getString("image_url"),
            rs.getString("brand"),
            ratingAvg,
            rs.getInt("rating_count"),
            rs.getInt("sold_count"),
            rs.getBoolean("active"),
            rs.getObject("created_at", LocalDateTime.class),
            rs.getObject("updated_at", LocalDateTime.class)
        );
    }
}
