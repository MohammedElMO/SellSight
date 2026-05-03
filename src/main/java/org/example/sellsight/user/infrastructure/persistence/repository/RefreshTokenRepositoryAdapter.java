package org.example.sellsight.user.infrastructure.persistence.repository;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.infrastructure.persistence.entity.RefreshTokenJpaEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository jpaRepository;

    @Override
    public RefreshToken save(RefreshToken token) {
        return toDomain(jpaRepository.save(toEntity(token)));
    }

    @Override
    public Optional<RefreshToken> findByTokenHash(String hash) {
        return jpaRepository.findByTokenHash(hash).map(this::toDomain);
    }

    @Override
    public Optional<RefreshToken> findById(String id) {
        return jpaRepository.findById(UUID.fromString(id)).map(this::toDomain);
    }

    @Override
    public List<RefreshToken> findByUserId(String userId) {
        return jpaRepository.findByUserId(userId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<RefreshToken> findActiveByUserId(String userId) {
        return jpaRepository.findActiveByUserId(userId).stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional
    public void revokeAllByUserId(String userId) {
        jpaRepository.revokeAllByUserId(userId);
    }

    @Override
    @Transactional
    public void revokeAllByFamilyId(String familyId) {
        jpaRepository.revokeAllByFamilyId(UUID.fromString(familyId));
    }

    // ── Mapping ──────────────────────────────────────────────

    private RefreshToken toDomain(RefreshTokenJpaEntity e) {
        RefreshToken rt = new RefreshToken();
        rt.setId(e.getId().toString());
        rt.setUserId(e.getUserId());
        rt.setTokenHash(e.getTokenHash());
        rt.setTokenFamilyId(e.getTokenFamilyId().toString());
        rt.setExpiresAt(e.getExpiresAt());
        rt.setCreatedAt(e.getCreatedAt());
        rt.setLastUsedAt(e.getLastUsedAt());
        rt.setRevokedAt(e.getRevokedAt());
        rt.setReplacedById(e.getReplacedById() != null ? e.getReplacedById().toString() : null);
        rt.setDeviceInfo(e.getDeviceInfo());
        rt.setIpAddress(e.getIpAddress());
        rt.setUserAgent(e.getUserAgent());
        return rt;
    }

    private RefreshTokenJpaEntity toEntity(RefreshToken rt) {
        RefreshTokenJpaEntity e = new RefreshTokenJpaEntity();
        e.setId(UUID.fromString(rt.getId()));
        e.setUserId(rt.getUserId());
        e.setTokenHash(rt.getTokenHash());
        e.setTokenFamilyId(UUID.fromString(rt.getTokenFamilyId()));
        e.setExpiresAt(rt.getExpiresAt());
        e.setCreatedAt(rt.getCreatedAt());
        e.setLastUsedAt(rt.getLastUsedAt());
        e.setRevokedAt(rt.getRevokedAt());
        e.setReplacedById(rt.getReplacedById() != null ? UUID.fromString(rt.getReplacedById()) : null);
        e.setDeviceInfo(rt.getDeviceInfo());
        e.setIpAddress(rt.getIpAddress());
        e.setUserAgent(rt.getUserAgent());
        return e;
    }
}
