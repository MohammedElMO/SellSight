package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;
import org.example.sellsight.user.infrastructure.persistence.mapper.UserPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter implementing the domain UserRepository port.
 * Delegates to Spring Data JPA and maps between domain/JPA models.
 */
@Component
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;

    public UserRepositoryAdapter(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = UserPersistenceMapper.toJpa(user);
        UserJpaEntity saved = jpaRepository.save(entity);
        return UserPersistenceMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(UserId id) {
        return jpaRepository.findById(id.getValue())
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue())
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.getValue());
    }

    @Override
    public Optional<User> findByAuthProviderAndProviderId(AuthProvider provider, String providerId) {
        return jpaRepository.findByAuthProviderAndProviderId(provider, providerId)
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll().stream()
                .map(UserPersistenceMapper::toDomain)
                .toList();
    }
}
