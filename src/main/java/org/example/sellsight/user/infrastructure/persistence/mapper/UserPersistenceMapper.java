package org.example.sellsight.user.infrastructure.persistence.mapper;

import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;

/**
 * Maps between domain User and JPA UserJpaEntity.
 * Static utility — no framework dependency.
 */
public final class UserPersistenceMapper {

    private UserPersistenceMapper() {}

    public static User toDomain(UserJpaEntity entity) {
        Password password = entity.getPassword() != null
                ? new Password(entity.getPassword())
                : null;

        return new User(
                UserId.from(entity.getId()),
                entity.getFirstName(),
                entity.getLastName(),
                new Email(entity.getEmail()),
                password,
                entity.getRole(),
                entity.getCreatedAt(),
                entity.isVirtual(),
                entity.getAuthProvider() != null ? entity.getAuthProvider() : AuthProvider.LOCAL,
                entity.getProviderId()
        );
    }

    public static UserJpaEntity toJpa(User user) {
        return new UserJpaEntity(
                user.getId().getValue(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail().getValue(),
                user.getPassword() != null ? user.getPassword().getHashedValue() : null,
                user.getRole(),
                user.getCreatedAt(),
                user.isVirtual(),
                user.getAuthProvider(),
                user.getProviderId()
        );
    }
}
