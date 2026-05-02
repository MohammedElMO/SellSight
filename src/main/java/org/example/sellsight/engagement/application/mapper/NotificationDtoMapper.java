package org.example.sellsight.engagement.application.mapper;

import org.example.sellsight.engagement.application.dto.NotificationDto;
import org.example.sellsight.engagement.domain.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationDtoMapper {

    @Mapping(target = "id", expression = "java(notification.getId().toString())")
    NotificationDto toDto(Notification notification);
}
