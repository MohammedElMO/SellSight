package org.example.sellsight.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;

/**
 * Service for generating, hashing, and managing auth cookies.
 * Three cookies are issued on every successful auth:
 *  - refresh_token: HttpOnly, path=/api/auth, 30-day lifetime
 *  - app_token:     HttpOnly, path=/, 15-min lifetime (access JWT — never readable by JS)
 *  - app_session:   non-HttpOnly, path=/, 30-day lifetime (role|emailVerified|sellerStatus for Next.js routing only)
 */
@Service
public class RefreshTokenService {

    @Value("${refresh-token.expiration:2592000000}")
    private long refreshExpirationMs;

    @Value("${jwt.expiration:900000}")
    private long accessExpirationMs;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a cryptographically random 32-byte raw token, encoded as a 64-char hex string.
     */
    public String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return bytesToHex(bytes);
    }

    /**
     * Hash the raw token using SHA-256, returning a 64-char hex string.
     */
    public String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(hexToBytes(raw));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /** HttpOnly refresh token cookie — scoped to /api/auth only. */
    public ResponseCookie buildCookie(String rawToken, boolean secure) {
        return ResponseCookie.from("refresh_token", rawToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    public ResponseCookie clearCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    /** HttpOnly access JWT cookie — sent on every request. Never readable by browser JS. */
    public ResponseCookie buildAccessCookie(String accessToken, boolean secure) {
        return ResponseCookie.from("app_token", accessToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMillis(accessExpirationMs))
                .build();
    }

    public ResponseCookie clearAccessCookie() {
        return ResponseCookie.from("app_token", "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    /**
     * Non-HttpOnly routing cookie for Next.js edge middleware.
     * Contains role|emailVerified|sellerStatus — no secrets.
     * Lifetime matches refresh token so navigations work between access-token renewals.
     */
    public ResponseCookie buildSessionCookie(String role, boolean emailVerified, String sellerStatus, boolean secure) {
        String value = role + "|" + emailVerified + "|" + (sellerStatus != null ? sellerStatus : "");
        return ResponseCookie.from("app_session", value)
                .httpOnly(false)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    public ResponseCookie clearSessionCookie() {
        return ResponseCookie.from("app_session", "")
                .httpOnly(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    public Instant getExpiresAt() {
        return Instant.now().plusMillis(refreshExpirationMs);
    }

    // ── Helpers ───────────────────────────────────────────────

    private static final char[] HEX_CHARS = "0123456789abcdef".toCharArray();

    private String bytesToHex(byte[] bytes) {
        char[] chars = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            chars[i * 2]     = HEX_CHARS[v >>> 4];
            chars[i * 2 + 1] = HEX_CHARS[v & 0x0F];
        }
        return new String(chars);
    }

    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
