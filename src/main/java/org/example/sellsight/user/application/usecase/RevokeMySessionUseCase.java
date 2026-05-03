package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.exception.InvalidTokenException;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Revokes a specific session owned by the authenticated user.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RevokeMySessionUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId, String sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new InvalidTokenException("Session not found"));

        if (!token.getUserId().equals(userId)) {
            throw new InvalidTokenException("Session does not belong to this user");
        }

        if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            log.info("Session {} revoked by userId={}", sessionId, userId);
        }
    }
}
