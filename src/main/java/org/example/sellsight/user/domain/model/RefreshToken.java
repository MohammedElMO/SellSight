package org.example.sellsight.user.domain.model;

import java.time.Instant;

/**
 * Domain model for a refresh token session.
 * Pure Java — no Spring or JPA annotations.
 */
public class RefreshToken {

    private String id;
    private String userId;
    private String tokenHash;
    private String tokenFamilyId;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant lastUsedAt;
    private Instant revokedAt;
    private String replacedById;
    private String deviceInfo;
    private String ipAddress;
    private String userAgent;

    public RefreshToken() {}

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isActive() {
        return !isExpired() && !isRevoked();
    }

    // ── Getters ──────────────────────────────────────────────

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getTokenHash() { return tokenHash; }
    public String getTokenFamilyId() { return tokenFamilyId; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public String getReplacedById() { return replacedById; }
    public String getDeviceInfo() { return deviceInfo; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }

    // ── Setters ──────────────────────────────────────────────

    public void setId(String id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public void setTokenFamilyId(String tokenFamilyId) { this.tokenFamilyId = tokenFamilyId; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }
    public void setReplacedById(String replacedById) { this.replacedById = replacedById; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
