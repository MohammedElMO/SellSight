package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Notification;
import org.example.sellsight.engagement.domain.repository.NotificationRepository;
import org.example.sellsight.engagement.infrastructure.persistence.mapper.NotificationPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpa;
    private final NotificationPersistenceMapper mapper;

    public NotificationRepositoryAdapter(NotificationJpaRepository jpa, NotificationPersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Notification save(Notification n) {
        return mapper.toDomain(jpa.save(mapper.toJpa(n)));
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Notification> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Notification> findUnreadByUserId(String userId) {
        return jpa.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public long countUnreadByUserId(String userId) {
        return jpa.countByUserIdAndReadFalse(userId);
    }

    @Override
    public void markAllReadByUserId(String userId) {
        jpa.markAllReadByUserId(userId);
    }
}
