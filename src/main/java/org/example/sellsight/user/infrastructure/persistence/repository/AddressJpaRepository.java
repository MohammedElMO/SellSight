package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.infrastructure.persistence.entity.AddressJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressJpaRepository extends JpaRepository<AddressJpaEntity, UUID> {
    List<AddressJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    @Modifying @Transactional
    @Query("UPDATE AddressJpaEntity a SET a.defaultShipping = false WHERE a.userId = :userId AND a.defaultShipping = true")
    void clearDefaultShipping(@Param("userId") String userId);

    @Modifying @Transactional
    @Query("UPDATE AddressJpaEntity a SET a.defaultBilling = false WHERE a.userId = :userId AND a.defaultBilling = true")
    void clearDefaultBilling(@Param("userId") String userId);
}
