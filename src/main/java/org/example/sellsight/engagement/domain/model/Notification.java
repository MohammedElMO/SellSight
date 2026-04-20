package org.example.sellsight.engagement.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * In-app notification for a user.
 */
public class Notification {

    private final UUID id;
    private final String userId;
    private final String type;
    private final String title;
    private final String body;
    private final String dataJson;
    private boolean read;
    private final LocalDateTime createdAt;

    public Notification(UUID id, String userId, String type, String title,
                        String body, String dataJson, boolean read,
                        LocalDateTime createdAt) {
        this.id = Objects.requireNonNull(id);
        this.userId = Objects.requireNonNull(userId);
        this.type = Objects.requireNonNull(type);
        this.title = Objects.requireNonNull(title);
        this.body = body;
        this.dataJson = dataJson;
        this.read = read;
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    public void markRead() {
        this.read = true;
    }

    // ── Getters ─────────────────────────────────────────────

    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getDataJson() { return dataJson; }
    public boolean isRead() { return read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
