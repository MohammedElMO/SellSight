package org.example.sellsight.engagement.infrastructure.persistence.mapper;

import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.infrastructure.persistence.entity.NotificationJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationPersistenceMapper {

    NotificationJpaEntity toJpa(Notification notification);

    default Notification toDomain(NotificationJpaEntity e) {
        return new Notification(
                e.getId(), e.getUserId(), e.getType(), e.getTitle(),
                e.getBody(), e.getDataJson(), e.isRead(), e.getCreatedAt()
        );
    }
}
