package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.RefreshTokenService;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Revokes the given refresh token (single-session logout).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public void execute(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        String hash = refreshTokenService.hashToken(rawToken);
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(hash);

        if (tokenOpt.isPresent()) {
            RefreshToken token = tokenOpt.get();
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
                log.info("Refresh token revoked for userId={}", token.getUserId());
            }
        }
    }
}
