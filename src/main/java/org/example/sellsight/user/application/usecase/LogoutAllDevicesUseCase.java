package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Revokes all active refresh tokens for a user (logout from all devices).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutAllDevicesUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        log.info("All refresh tokens revoked for userId={}", userId);
    }
}
