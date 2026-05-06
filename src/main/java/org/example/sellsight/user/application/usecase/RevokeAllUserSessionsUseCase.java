package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.exception.SuperAdminProtectedException;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new SuperAdminProtectedException("revoke sessions for");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Admin sessions cannot be revoked via this endpoint. Use the Super Admin panel.");
        }
        // Soft-revoke first so any in-flight requests using these tokens are rejected immediately
        refreshTokenRepository.revokeAllByUserId(userId);
        // Hard-delete: remove the rows from the table entirely
        refreshTokenRepository.deleteAllByUserId(userId);
        log.info("Admin revoked and deleted all sessions for userId={}", userId);
    }
}
