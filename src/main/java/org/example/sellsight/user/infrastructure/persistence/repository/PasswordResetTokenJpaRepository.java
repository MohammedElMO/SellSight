package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.infrastructure.persistence.entity.PasswordResetTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PasswordResetTokenJpaRepository
        extends JpaRepository<PasswordResetTokenJpaEntity, UUID> {

    void deleteAllByUserId(String userId);
}
