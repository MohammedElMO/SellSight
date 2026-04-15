package org.example.sellsight.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

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

    /**
     * Generate a JWT token with email as subject and role as claim.
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extract the email (subject) from a token.
     */
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Extract the role claim from a token.
     */
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

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
