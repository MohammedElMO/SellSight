package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.NotificationDto;
import org.example.sellsight.engagement.application.mapper.NotificationDtoMapper;
import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class GetNotificationsUseCase {

    private final NotificationRepository notificationRepository;
    private final NotificationDtoMapper notificationDtoMapper;

    public GetNotificationsUseCase(NotificationRepository notificationRepository,
                                   NotificationDtoMapper notificationDtoMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationDtoMapper = notificationDtoMapper;
    }

    public List<NotificationDto> execute(String userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(notificationDtoMapper::toDto)
                .toList();
    }

    public List<NotificationDto> getUnread(String userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(notificationDtoMapper::toDto)
                .toList();
    }

    public long countUnread(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public void markRead(String notificationId, String userId) {
        Notification n = notificationRepository.findById(UUID.fromString(notificationId))
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied");
        }
        n.markRead();
        notificationRepository.save(n);
    }

    public void markAllRead(String userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
