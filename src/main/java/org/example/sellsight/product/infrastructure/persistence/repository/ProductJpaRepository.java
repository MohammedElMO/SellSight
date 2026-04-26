package org.example.sellsight.product.infrastructure.persistence.repository;

import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, String>,
        JpaSpecificationExecutor<ProductJpaEntity>, ProductJpaRepositoryCustom {

    Page<ProductJpaEntity> findByActiveTrue(Pageable pageable);

        Page<ProductJpaEntity> findBySellerId(String sellerId, Pageable pageable);

    Page<ProductJpaEntity> findByCategoryAndActiveTrue(String category, Pageable pageable);

    @Query(value = """
            SELECT * FROM products
            WHERE active = true
              AND search_vector @@ websearch_to_tsquery('english', :query)
            """,
           countQuery = """
            SELECT count(*) FROM products
            WHERE active = true
              AND search_vector @@ websearch_to_tsquery('english', :query)
            """, nativeQuery = true)
    Page<ProductJpaEntity> searchByFullText(@Param("query") String query, Pageable pageable);

    @Query(value = """
            SELECT p.* FROM products p
            WHERE p.active = true
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT :size
            """, nativeQuery = true)
    List<ProductJpaEntity> findActiveFirst(@Param("size") int size);

    // Keyset (seek) pagination — avoids OFFSET on deep pages.
    // CTE resolves the cursor row once instead of two correlated subqueries.
    @Query(value = """
            WITH cursor AS (SELECT created_at, id FROM products WHERE id = :lastId)
            SELECT p.* FROM products p, cursor
            WHERE p.active = true
              AND (p.created_at < cursor.created_at
                   OR (p.created_at = cursor.created_at AND p.id < cursor.id))
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT :size
            """, nativeQuery = true)
    List<ProductJpaEntity> findActiveBefore(@Param("lastId") String lastId, @Param("size") int size);

}
