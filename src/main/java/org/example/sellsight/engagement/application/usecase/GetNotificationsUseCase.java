package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.NotificationDto;
import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Retrieve notifications and mark them as read.
 */
@Slf4j
@Component
public class GetNotificationsUseCase {

    private final NotificationRepository notificationRepository;

    public GetNotificationsUseCase(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDto> execute(String userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<NotificationDto> getUnread(String userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::toDto)
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

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId().toString(),
                n.getType(),
                n.getTitle(),
                n.getBody(),
                n.getDataJson(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
