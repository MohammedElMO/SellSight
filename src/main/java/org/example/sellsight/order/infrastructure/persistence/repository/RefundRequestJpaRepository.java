package org.example.sellsight.order.infrastructure.persistence.repository;

import org.example.sellsight.order.infrastructure.persistence.entity.RefundRequestJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRequestJpaRepository extends JpaRepository<RefundRequestJpaEntity, UUID> {
    Optional<RefundRequestJpaEntity> findByOrderId(String orderId);
    List<RefundRequestJpaEntity> findByCustomerId(String customerId);
}
