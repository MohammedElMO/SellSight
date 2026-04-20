package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.example.sellsight.engagement.infrastructure.persistence.entity.NotificationJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpa;

    public NotificationRepositoryAdapter(NotificationJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Notification save(Notification n) {
        var entity = toJpa(n);
        var saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<Notification> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public List<Notification> findUnreadByUserId(String userId) {
        return jpa.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public long countUnreadByUserId(String userId) {
        return jpa.countByUserIdAndReadFalse(userId);
    }

    @Override
    public void markAllReadByUserId(String userId) {
        jpa.markAllReadByUserId(userId);
    }

    private NotificationJpaEntity toJpa(Notification n) {
        var e = new NotificationJpaEntity();
        e.setId(n.getId());
        e.setUserId(n.getUserId());
        e.setType(n.getType());
        e.setTitle(n.getTitle());
        e.setBody(n.getBody());
        e.setDataJson(n.getDataJson());
        e.setRead(n.isRead());
        e.setCreatedAt(n.getCreatedAt());
        return e;
    }

    private Notification toDomain(NotificationJpaEntity e) {
        return new Notification(
                e.getId(),
                e.getUserId(),
                e.getType(),
                e.getTitle(),
                e.getBody(),
                e.getDataJson(),
                e.isRead(),
                e.getCreatedAt()
        );
    }
}
