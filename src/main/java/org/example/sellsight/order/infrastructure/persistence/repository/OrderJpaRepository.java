package org.example.sellsight.order.infrastructure.persistence.repository;

import org.example.sellsight.order.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, String> {
    List<OrderJpaEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<OrderJpaEntity> findAllByOrderByCreatedAtDesc();
}
