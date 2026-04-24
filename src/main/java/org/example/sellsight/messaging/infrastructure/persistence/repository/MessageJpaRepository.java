package org.example.sellsight.messaging.infrastructure.persistence.repository;

import org.example.sellsight.messaging.infrastructure.persistence.entity.OrderMessageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageJpaRepository extends JpaRepository<OrderMessageJpaEntity, UUID> {
    List<OrderMessageJpaEntity> findByOrderIdOrderBySentAtAsc(String orderId);
}
