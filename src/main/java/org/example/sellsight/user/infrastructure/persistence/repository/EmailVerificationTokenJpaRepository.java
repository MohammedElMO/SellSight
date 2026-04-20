package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.infrastructure.persistence.entity.EmailVerificationTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmailVerificationTokenJpaRepository
        extends JpaRepository<EmailVerificationTokenJpaEntity, UUID> {

    void deleteAllByUserId(String userId);
}
