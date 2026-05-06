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

    // TWO-PHASE HYBRID SEARCH
    // Phase 1: HNSW ANN scan finds the top CANDIDATE_K most semantically similar products.
    //          The HNSW index is used here (ORDER BY embedding <=> vec LIMIT k).
    // Phase 2: Re-rank only those candidates using a combined vector + FTS score.
    //          FTS re-scoring on 200 rows is trivial vs computing distances on 50k+ FTS matches.
    //
    // This avoids the previous bottleneck: filtering 500k rows by FTS then computing vector
    // distance for every match before sorting — which bypasses the HNSW index entirely.
    private static final int CANDIDATE_K = 200; // over-fetch factor for re-ranking

    private static final String HYBRID_SEARCH_SQL = """
            WITH ann AS (
                SELECT id,
                       1.0 - (embedding <=> CAST(? AS vector)) AS vector_score
                FROM products
                WHERE active = true AND embedding IS NOT NULL
                ORDER BY embedding <=> CAST(? AS vector)
                LIMIT ?
            ),
            ranked AS (
                SELECT p.id, p.name, p.description, p.price, p.category, p.seller_id,
                       p.image_url, p.brand, p.rating_avg, p.rating_count, p.sold_count,
                       p.active, p.created_at, p.updated_at,
                       ann.vector_score * 0.7
                         + COALESCE(ts_rank(p.search_vector, websearch_to_tsquery('english', ?)), 0.0) * 0.3 AS score
                FROM products p
                JOIN ann ON p.id = ann.id
                WHERE p.search_vector @@ websearch_to_tsquery('english', ?)
            )
            SELECT id, name, description, price, category, seller_id,
                   image_url, brand, rating_avg, rating_count, sold_count,
                   active, created_at, updated_at
            FROM ranked
            ORDER BY score DESC
            LIMIT ? OFFSET ?
            """;

    // Capped COUNT: stop counting after COUNT_CAP+1 matches to avoid full FTS scans.
    // For broad terms ("phone") this prevents counting all 400k matches.
    private static final int COUNT_CAP = 10_000;

    private static final String HYBRID_COUNT_SQL = """
            SELECT COUNT(*) FROM (
                SELECT 1
                FROM products p
                WHERE p.active = true
                  AND p.search_vector @@ websearch_to_tsquery('english', ?)
                LIMIT ?
            ) sub
            """;

    private final ProductJpaRepository jpaRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ProductPersistenceMapper mapper;

    public ProductRepositoryAdapter(ProductJpaRepository jpaRepository, JdbcTemplate jdbcTemplate,
                                    ProductPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.mapper = mapper;
    }

    @Override
    public Product save(Product product) {
        var entity = mapper.toJpa(product);
        var saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return jpaRepository.findById(id.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public ProductSlice findAll(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toProductSlice(jpaRepository.findByActiveTrue(pageable));
    }

    @Override
    public ProductSlice findBySellerId(String sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toProductSlice(jpaRepository.findBySellerId(sellerId, pageable));
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
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Product> findActiveBefore(String lastId, int size) {
        return jpaRepository.findActiveBefore(lastId, size).stream()
                .map(mapper::toDomain)
                .toList();
    }

    private ProductSlice toProductSlice(Page<ProductJpaEntity> page) {
        List<Product> items = page.getContent().stream()
                .map(mapper::toDomain)
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

        // Phase-1 params: vectorStr (ANN ordering), vectorStr again (score computation)
        // Phase-2 params: CANDIDATE_K, ftsQuery (ts_rank), ftsQuery (FTS filter), size, offset
        List<Product> products = jdbcTemplate.query(
            HYBRID_SEARCH_SQL,
            (rs, rowNum) -> mapRow(rs),
            vectorStr, vectorStr, CANDIDATE_K, ftsQuery, ftsQuery, size, offset
        );

        // Capped count — stop scanning after COUNT_CAP+1 rows
        Long rawCount = jdbcTemplate.queryForObject(
            HYBRID_COUNT_SQL,
            Long.class,
            ftsQuery, COUNT_CAP + 1
        );
        long totalElements = rawCount != null ? Math.min(rawCount, COUNT_CAP + 1L) : 0L;
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
