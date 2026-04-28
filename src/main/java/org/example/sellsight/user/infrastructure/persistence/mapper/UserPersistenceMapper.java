package org.example.sellsight.user.infrastructure.persistence.mapper;

import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;

/**
 * Maps between domain User and JPA UserJpaEntity.
 */
public final class UserPersistenceMapper {

    private UserPersistenceMapper() {}

    public static User toDomain(UserJpaEntity entity) {
        Password password = entity.getPassword() != null
                ? new Password(entity.getPassword())
                : null;

        User user = new User(
                UserId.from(entity.getId()),
                entity.getFirstName(),
                entity.getLastName(),
                new Email(entity.getEmail()),
                password,
                entity.getRole(),
                entity.getCreatedAt(),
                entity.isVirtual(),
                entity.getAuthProvider() != null ? entity.getAuthProvider() : AuthProvider.LOCAL,
                entity.getProviderId(),
                entity.isEmailVerified(),
                entity.getDeletedAt(),
                entity.getSellerStatus()
        );
        if (entity.getAvatarUrl() != null) {
            user.changeAvatar(entity.getAvatarUrl());
        }
        return user;
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
                user.getProviderId(),
                user.isEmailVerified(),
                user.getDeletedAt(),
                user.getSellerStatus(),
                user.getAvatarUrl()
        );
    }
}
