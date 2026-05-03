package org.example.sellsight.config.security;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AuthBundle;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Shared helper for issuing an access JWT + refresh token pair.
 * Used by all auth use cases that need to return credentials.
 */
@Component
@RequiredArgsConstructor
public class TokenPairHelper {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Issue a new access token + refresh token for the given user, storing the
     * refresh token in the DB.
     *
     * @param user       authenticated user
     * @param ipAddress  client IP (may be null)
     * @param userAgent  client user-agent (may be null)
     * @return AuthBundle containing AuthResponse (for body) and raw refresh token (for cookie)
     */
    public AuthBundle issue(User user, String ipAddress, String userAgent) {
        String sellerStatusStr = user.getSellerStatus() != null ? user.getSellerStatus().name() : null;

        String accessToken = jwtService.generateToken(
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isEmailVerified(),
                sellerStatusStr
        );

        String rawRefreshToken = refreshTokenService.generateRawToken();
        String tokenHash = refreshTokenService.hashToken(rawRefreshToken);
        String familyId = UUID.randomUUID().toString();

        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID().toString());
        rt.setUserId(user.getId().getValue());
        rt.setTokenHash(tokenHash);
        rt.setTokenFamilyId(familyId);
        rt.setExpiresAt(refreshTokenService.getExpiresAt());
        rt.setCreatedAt(Instant.now());
        rt.setIpAddress(ipAddress);
        rt.setUserAgent(userAgent);
        refreshTokenRepository.save(rt);

        AuthResponse authResponse = new AuthResponse(
                accessToken,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.isEmailVerified(),
                sellerStatusStr
        );

        return new AuthBundle(authResponse, rawRefreshToken);
    }
}
