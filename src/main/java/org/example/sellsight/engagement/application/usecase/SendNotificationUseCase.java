package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.NotificationDto;
import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persists an in-app notification and pushes it to the user's live SSE stream.
 */
@Slf4j
@Component
public class SendNotificationUseCase {

    private final NotificationRepository notificationRepository;
    private final RealtimePublisher realtimePublisher;

    public SendNotificationUseCase(NotificationRepository notificationRepository,
                                   RealtimePublisher realtimePublisher) {
        this.notificationRepository = notificationRepository;
        this.realtimePublisher = realtimePublisher;
    }

    public void send(String userId, String type, String title, String body) {
        Notification n = new Notification(
                UUID.randomUUID(), userId, type, title, body, null, false, LocalDateTime.now()
        );
        notificationRepository.save(n);

        // Push to SSE stream so the client updates the badge without polling
        NotificationDto dto = new NotificationDto(
                n.getId().toString(), n.getType(), n.getTitle(), n.getBody(),
                n.getDataJson(), n.isRead(), n.getCreatedAt()
        );
        try {
            realtimePublisher.pushToUser(userId, "notification", dto);
        } catch (Exception e) {
            log.debug("SSE push skipped (no connected client): userId={}", userId);
        }
    }
}
