package org.example.sellsight.product.infrastructure.persistence.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Root;
import org.example.sellsight.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

class ProductJpaRepositoryCustomImpl implements ProductJpaRepositoryCustom {

    // JDBC-side cursor buffer. Prevents the driver from materialising the
    // entire result set in memory on large scans.
    private static final int JDBC_FETCH_SIZE = 100;

    @PersistenceContext
    private EntityManager em;

    @Override
    public Page<ProductJpaEntity> findAllSliced(Specification<ProductJpaEntity> spec, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        // Count query
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<ProductJpaEntity> countRoot = countCq.from(ProductJpaEntity.class);
        countCq.select(cb.count(countRoot));
        if (spec != null) {
            countCq.where(spec.toPredicate(countRoot, countCq, cb));
        }
        long total = em.createQuery(countCq).getSingleResult();

        // Data query — project only columns needed for listing (skip description)
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<ProductJpaEntity> root = cq.from(ProductJpaEntity.class);
        cq.multiselect(
                root.get("id"),
                root.get("name"),
                root.get("price"),
                root.get("category"),
                root.get("sellerId"),
                root.get("imageUrl"),
                root.get("brand"),
                root.get("ratingAvg"),
                root.get("ratingCount"),
                root.get("soldCount"),
                root.get("active"),
                root.get("createdAt"),
                root.get("updatedAt")
        );

        if (spec != null) {
            cq.where(spec.toPredicate(root, cq, cb));
        }

        if (pageable.getSort().isSorted()) {
            List<Order> orders = new ArrayList<>();
            for (Sort.Order so : pageable.getSort()) {
                orders.add(so.isAscending()
                        ? cb.asc(root.get(so.getProperty()))
                        : cb.desc(root.get(so.getProperty())));
            }
            cq.orderBy(orders);
        }

        TypedQuery<Object[]> query = em.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        query.setHint("org.hibernate.fetchSize", JDBC_FETCH_SIZE);
        query.setHint("org.hibernate.readOnly", true);

        List<Object[]> rows = query.getResultList();
        List<ProductJpaEntity> results = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            results.add(fromRow(r));
        }
        return new PageImpl<>(results, pageable, total);
    }

    private static ProductJpaEntity fromRow(Object[] r) {
        return new ProductJpaEntity(
                (String) r[0],              // id
                (String) r[1],              // name
                null,                        // description — omitted from list projection
                (BigDecimal) r[2],          // price
                (String) r[3],              // category
                (String) r[4],              // sellerId
                (String) r[5],              // imageUrl
                (String) r[6],              // brand
                (BigDecimal) r[7],          // ratingAvg
                (int) r[8],                  // ratingCount
                (int) r[9],                  // soldCount
                (boolean) r[10],             // active
                (LocalDateTime) r[11],      // createdAt
                (LocalDateTime) r[12]       // updatedAt
        );
    }
}
