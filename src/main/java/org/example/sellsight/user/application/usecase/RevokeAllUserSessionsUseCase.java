package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin: revoke all sessions for a specific user.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RevokeAllUserSessionsUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        log.info("Admin revoked all sessions for userId={}", userId);
    }
}
