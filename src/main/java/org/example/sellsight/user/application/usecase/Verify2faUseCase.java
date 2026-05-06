package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.TokenPairHelper;
import org.example.sellsight.config.security.TotpService;
import org.example.sellsight.user.application.dto.AuthBundle;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.exception.TwoFactorLockedException;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class Verify2faUseCase {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final TokenPairHelper tokenPairHelper;

    public AuthBundle execute(String challengeToken, String code, String ipAddress, String userAgent) {
        String userId = jwtService.extractUserIdFromChallengeToken(challengeToken);
        if (userId == null) {
            log.warn("2FA verify failed — invalid or expired challenge token");
            throw new InvalidCredentialsException("Invalid or expired 2FA session. Please log in again.");
        }

        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid 2FA session."));

        if (user.isDeleted() || user.isDisabled()) {
            log.warn("2FA verify blocked — account state invalid for userId={}", userId);
            throw new InvalidCredentialsException();
        }

        if (user.getFailed2faAttempts() >= MAX_FAILED_ATTEMPTS) {
            log.warn("2FA locked — too many failed attempts for userId={}", userId);
            throw new TwoFactorLockedException();
        }

        boolean isTotpCode = code.matches("\\d{6}");

        if (user.getTotpSecret() == null || user.getTotpSecret().isBlank()) {
            log.warn("2FA verify failed — no TOTP secret configured for userId={}", userId);
            throw new InvalidCredentialsException("2FA not properly configured. Contact your administrator.");
        }

        if (isTotpCode) {
            String plainSecret;
            try {
                plainSecret = totpService.decryptSecret(user.getTotpSecret());
            } catch (Exception e) {
                log.error("TOTP secret decryption failed for userId={}", userId, e);
                throw new InvalidCredentialsException("2FA configuration error. Contact your administrator.");
            }
            if (!totpService.verifyCode(plainSecret, code)) {
                log.warn("2FA verify failed — wrong TOTP code for userId={}", userId);
                user.recordFailed2faAttempt();
                userRepository.save(user);
                if (user.getFailed2faAttempts() >= MAX_FAILED_ATTEMPTS) {
                    throw new TwoFactorLockedException();
                }
                throw new InvalidCredentialsException("Invalid authenticator code.");
            }
        } else {
            if (!checkAndConsumeBackupCode(user, code)) {
                log.warn("2FA verify failed — wrong backup code for userId={}", userId);
                user.recordFailed2faAttempt();
                userRepository.save(user);
                if (user.getFailed2faAttempts() >= MAX_FAILED_ATTEMPTS) {
                    throw new TwoFactorLockedException();
                }
                throw new InvalidCredentialsException("Invalid backup code.");
            }
            log.info("2FA backup code used for userId={}", userId);
        }

        user.record2faVerified();
        userRepository.save(user);
        log.info("2FA verified for userId={} email={}", userId, user.getEmail().getValue());
        return tokenPairHelper.issue(user, ipAddress, userAgent);
    }

    private boolean checkAndConsumeBackupCode(User user, String rawCode) {
        String stored = user.getTotpBackupCodes();
        if (stored == null || stored.isBlank()) return false;

        String codeHash = sha256(rawCode.trim().toUpperCase());
        List<String> hashes = new ArrayList<>(Arrays.asList(stored.split(",")));

        if (hashes.remove(codeHash)) {
            user.consumeBackupCode(hashes.isEmpty() ? null : String.join(",", hashes));
            return true;
        }
        return false;
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
