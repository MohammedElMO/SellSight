package org.example.sellsight.user.infrastructure.persistence.mapper;

import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserPersistenceMapper {

    @Mapping(target = "id", expression = "java(user.getId().getValue())")
    @Mapping(target = "email", expression = "java(user.getEmail().getValue())")
    @Mapping(target = "password", expression = "java(user.getPassword() != null ? user.getPassword().getHashedValue() : null)")
    UserJpaEntity toJpa(User user);

    default User toDomain(UserJpaEntity e) {
        Password password = e.getPassword() != null ? new Password(e.getPassword()) : null;
        User user = new User(
                UserId.from(e.getId()),
                e.getFirstName(),
                e.getLastName(),
                new Email(e.getEmail()),
                password,
                e.getRole(),
                e.getCreatedAt(),
                e.isVirtual(),
                e.getAuthProvider() != null ? e.getAuthProvider() : AuthProvider.LOCAL,
                e.getProviderId(),
                e.isEmailVerified(),
                e.getDeletedAt(),
                e.getSellerStatus()
        );
        if (e.getAvatarUrl() != null) {
            user.changeAvatar(e.getAvatarUrl());
        }
        return user;
    }
}
