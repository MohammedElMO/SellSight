package org.example.sellsight.order.infrastructure.persistence.repository;

import org.example.sellsight.order.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, String> {
    List<OrderJpaEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<OrderJpaEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM OrderJpaEntity o JOIN o.items i WHERE i.sellerId = :sellerId ORDER BY o.createdAt DESC")
    List<OrderJpaEntity> findByItemSellerId(@Param("sellerId") String sellerId);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
           "FROM OrderJpaEntity o JOIN o.items i " +
           "WHERE o.customerId = :customerId AND i.productId = :productId AND o.status = 'DELIVERED'")
    boolean existsDeliveredOrderWithProduct(@Param("customerId") String customerId,
                                             @Param("productId") String productId);
}
