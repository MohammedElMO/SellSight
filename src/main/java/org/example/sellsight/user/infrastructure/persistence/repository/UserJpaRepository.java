package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.domain.model.AuthProvider;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.SellerStatus;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for UserJpaEntity.
 */
@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, String>,
        JpaSpecificationExecutor<UserJpaEntity> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<UserJpaEntity> findByAuthProviderAndProviderId(AuthProvider authProvider, String providerId);

    List<UserJpaEntity> findAllByRoleAndSellerStatus(Role role, SellerStatus sellerStatus);
}
