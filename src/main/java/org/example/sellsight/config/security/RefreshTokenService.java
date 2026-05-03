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
 * Service for generating, hashing, and managing refresh token cookies.
 */
@Service
public class RefreshTokenService {

    @Value("${refresh-token.expiration:2592000000}")
    private long refreshExpirationMs;

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

    /**
     * Build an HttpOnly, SameSite=Lax refresh token cookie.
     * Path is /api/auth so it's only sent to auth endpoints.
     */
    public ResponseCookie buildCookie(String rawToken, boolean secure) {
        return ResponseCookie.from("refresh_token", rawToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    /**
     * Build a cookie that clears the refresh token (maxAge=0).
     */
    public ResponseCookie clearCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    /**
     * Calculate the expiry instant for a new refresh token.
     */
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
