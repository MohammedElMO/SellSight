package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.RefreshTokenService;
import org.example.sellsight.user.application.dto.AuthBundle;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.domain.exception.AccountDisabledException;
import org.example.sellsight.user.domain.exception.InvalidTokenException;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Validates a refresh token and issues a new access + refresh token pair (rotation).
 * Implements token family reuse detection: if a revoked token is presented,
 * all tokens in that family are revoked (compromise assumed).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshAccessTokenUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @Transactional
    public AuthBundle execute(String rawToken, String ipAddress, String userAgent) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidTokenException("No refresh token provided");
        }

        String hash = refreshTokenService.hashToken(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("Session not found"));

        if (token.isExpired()) {
            throw new InvalidTokenException("Session expired");
        }

        if (token.isRevoked()) {
            // Token reuse detected — revoke entire family
            log.warn("Refresh token reuse detected for family={} userId={} — revoking all family tokens",
                    token.getTokenFamilyId(), token.getUserId());
            refreshTokenRepository.revokeAllByFamilyId(token.getTokenFamilyId());
            throw new InvalidTokenException("Suspicious session reuse detected");
        }

        User user = userRepository.findById(UserId.from(token.getUserId()))
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new InvalidTokenException("User account no longer exists"));

        if (user.isDisabled()) {
            throw new AccountDisabledException();
        }

        // Create new refresh token (same family, new hash, new id)
        String newRawToken = refreshTokenService.generateRawToken();
        String newHash = refreshTokenService.hashToken(newRawToken);
        String newId = UUID.randomUUID().toString();

        RefreshToken newToken = new RefreshToken();
        newToken.setId(newId);
        newToken.setUserId(user.getId().getValue());
        newToken.setTokenHash(newHash);
        newToken.setTokenFamilyId(token.getTokenFamilyId());
        newToken.setExpiresAt(refreshTokenService.getExpiresAt());
        newToken.setCreatedAt(Instant.now());
        newToken.setIpAddress(ipAddress);
        newToken.setUserAgent(userAgent);
        refreshTokenRepository.save(newToken);

        // Rotate: mark old token as replaced + revoked
        token.setReplacedById(newId);
        token.setRevokedAt(Instant.now());
        token.setLastUsedAt(Instant.now());
        refreshTokenRepository.save(token);

        // Generate fresh access token
        String sellerStatusStr = user.getSellerStatus() != null ? user.getSellerStatus().name() : null;
        String accessToken = jwtService.generateToken(
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isEmailVerified(),
                sellerStatusStr
        );

        AuthResponse authResponse = new AuthResponse(
                accessToken,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.isEmailVerified(),
                sellerStatusStr
        );

        return new AuthBundle(authResponse, newRawToken);
    }
}
