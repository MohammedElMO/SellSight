package org.example.sellsight.config.security;

import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Slf4j
@Service
public class TotpService {

    private static final String ISSUER         = "SellSight";
    private static final int    GCM_IV_LENGTH  = 12;
    private static final int    GCM_TAG_BITS   = 128;
    private static final int    KEY_BYTES       = 32;

    @Value("${app.totp.encryption-key}")
    private String encryptionKeyBase64;

    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator(32);
    private final DefaultCodeVerifier    codeVerifier;
    private final SecureRandom           rng             = new SecureRandom();

    public TotpService() {
        DefaultCodeGenerator codeGenerator = new DefaultCodeGenerator();
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, new SystemTimeProvider());
        this.codeVerifier.setTimePeriod(30);
        this.codeVerifier.setAllowedTimePeriodDiscrepancy(1);
    }

    // ── Key generation ──────────────────────────────────────────

    public String generateSecret() {
        return secretGenerator.generate();
    }

    // ── Encryption at rest ──────────────────────────────────────

    /**
     * AES-256-GCM encrypt a plain TOTP secret.
     * Output: base64(12-byte-IV || ciphertext+tag) — safe to store in DB.
     */
    public String encryptSecret(String plainSecret) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            rng.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, buildKey(), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plainSecret.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv,         0, combined, 0,         iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("TOTP secret encryption failed", e);
        }
    }

    /**
     * AES-256-GCM decrypt a stored secret.
     * Input must be the base64 blob produced by {@link #encryptSecret}.
     */
    public String decryptSecret(String encryptedSecret) {
        try {
            byte[] combined    = Base64.getDecoder().decode(encryptedSecret);
            byte[] iv          = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
            byte[] ciphertext  = Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, buildKey(), new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("TOTP secret decryption failed", e);
        }
    }

    // ── QR & verification (both expect PLAIN secret) ────────────

    public String generateQrCodeBase64(String plainSecret, String accountEmail) {
        QrData data = new QrData.Builder()
                .label(accountEmail)
                .secret(plainSecret)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        try {
            byte[] png = new ZxingPngQrGenerator().generate(data);
            return Base64.getEncoder().encodeToString(png);
        } catch (QrGenerationException e) {
            log.error("QR code generation failed for email={}", accountEmail, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /** Verify a 6-digit TOTP code against a PLAIN (decrypted) secret. */
    public boolean verifyCode(String plainSecret, String code) {
        return codeVerifier.isValidCode(plainSecret, code);
    }

    // ── Internal ────────────────────────────────────────────────

    private SecretKeySpec buildKey() {
        byte[] keyBytes = Base64.getDecoder().decode(encryptionKeyBase64);
        if (keyBytes.length != KEY_BYTES) {
            throw new IllegalStateException(
                    "app.totp.encryption-key must decode to exactly 32 bytes (256-bit AES key). " +
                    "Got " + keyBytes.length + " bytes.");
        }
        return new SecretKeySpec(keyBytes, "AES");
    }
}
