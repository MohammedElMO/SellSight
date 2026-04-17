package org.example.sellsight.analytics.infrastructure.persistence.repository;

import org.example.sellsight.analytics.infrastructure.persistence.entity.UserEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for user_events.
 * Used exclusively by EventRepositoryAdapter — never by domain or application code.
 */
public interface EventJpaRepository extends JpaRepository<UserEventJpaEntity, UUID> {

    List<UserEventJpaEntity> findByUserId(String userId);

    List<UserEventJpaEntity> findByProductId(String productId);
}
