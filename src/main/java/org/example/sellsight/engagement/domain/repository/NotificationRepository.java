package org.example.sellsight.engagement.domain.repository;

import org.example.sellsight.engagement.domain.model.Notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Outbound port for notification persistence. */
public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(UUID id);
    List<Notification> findByUserId(String userId);
    List<Notification> findUnreadByUserId(String userId);
    long countUnreadByUserId(String userId);
    void markAllReadByUserId(String userId);
}
