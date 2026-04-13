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
        return new User(
                UserId.from(entity.getId()),
                entity.getFirstName(),
                entity.getLastName(),
                new Email(entity.getEmail()),
                new Password(entity.getPassword()),
                entity.getRole(),
                entity.getCreatedAt()
        );
    }

    public static UserJpaEntity toJpa(User user) {
        return new UserJpaEntity(
                user.getId().getValue(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail().getValue(),
                user.getPassword().getHashedValue(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
