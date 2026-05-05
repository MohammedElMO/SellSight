package org.example.sellsight.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT utility service — generates and validates tokens using HMAC-SHA256.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(String email, String role, boolean emailVerified, String sellerStatus) {
        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(email)
                .claim("role", role)
                .claim("emailVerified", emailVerified)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration));

        if (sellerStatus != null) {
            builder.claim("sellerStatus", sellerStatus);
        }

        return builder.signWith(signingKey).compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Validate that the token is not expired and the subject matches.
     */
    public boolean isTokenValid(String token, String email) {
        try {
            Claims claims = extractClaims(token);
            return claims.getSubject().equals(email)
                    && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private static final long CHALLENGE_EXPIRY_MS = 2 * 60 * 1000;  // 2 min
    private static final long SETUP_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 min

    public String generateSetupToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .claim("type", "2fa_setup")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + SETUP_TOKEN_EXPIRY_MS))
                .signWith(signingKey)
                .compact();
    }

    public String extractUserIdFromSetupToken(String token) {
        try {
            Claims claims = extractClaims(token);
            if (!"2fa_setup".equals(claims.get("type", String.class))) return null;
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String generateChallengeToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .claim("type", "2fa_challenge")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + CHALLENGE_EXPIRY_MS))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Returns the userId (sub) from a 2FA challenge token, or null if invalid/expired/wrong type.
     */
    public String extractUserIdFromChallengeToken(String token) {
        try {
            Claims claims = extractClaims(token);
            if (!"2fa_challenge".equals(claims.get("type", String.class))) return null;
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
