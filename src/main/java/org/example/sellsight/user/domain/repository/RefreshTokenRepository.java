package org.example.sellsight.user.domain.repository;

import org.example.sellsight.user.domain.model.RefreshToken;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository {
    RefreshToken save(RefreshToken token);
    Optional<RefreshToken> findByTokenHash(String hash);
    Optional<RefreshToken> findById(String id);
    List<RefreshToken> findByUserId(String userId);
    List<RefreshToken> findActiveByUserId(String userId);
    void revokeAllByUserId(String userId);
    void revokeAllByFamilyId(String familyId);
}
