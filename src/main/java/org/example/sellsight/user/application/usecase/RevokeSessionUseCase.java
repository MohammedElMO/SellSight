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
 * Admin: revoke any session by id (no ownership check).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RevokeSessionUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new InvalidTokenException("Session not found"));

        if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            log.info("Admin revoked session={} for userId={}", sessionId, token.getUserId());
        }
    }
}
