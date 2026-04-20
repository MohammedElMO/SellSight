package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persists an in-app notification for the given user.
 */
@Component
public class SendNotificationUseCase {

    private final NotificationRepository notificationRepository;

    public SendNotificationUseCase(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void send(String userId, String type, String title, String body) {
        Notification n = new Notification(
                UUID.randomUUID(),
                userId,
                type,
                title,
                body,
                null,
                false,
                LocalDateTime.now()
        );
        notificationRepository.save(n);
    }
}
