package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.TokenPairHelper;
import org.example.sellsight.config.security.TotpService;
import org.example.sellsight.user.application.dto.SetupCompleteBundle;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class Complete2faSetupUseCase {

    private static final String BACKUP_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int BACKUP_CODE_LENGTH   = 8;
    private static final int BACKUP_CODE_COUNT    = 8;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final TokenPairHelper tokenPairHelper;

    public SetupCompleteBundle execute(String setupToken, String code, String ipAddress, String userAgent) {
        String userId = jwtService.extractUserIdFromSetupToken(setupToken);
        if (userId == null) throw new InvalidCredentialsException("Invalid or expired setup token.");

        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid setup token."));

        if (user.isDeleted() || user.isDisabled())
            throw new InvalidCredentialsException("Account unavailable.");

        if (user.isTotpEnabled() || !user.isAdmin2faSetupRequired() || user.getTotpSecret() == null)
            throw new InvalidCredentialsException("Setup token is no longer valid. Call /start first.");

        if (user.isForcePasswordChange())
            throw new InvalidCredentialsException("Password change required before completing 2FA setup.");

        String plainSecret = totpService.decryptSecret(user.getTotpSecret());
        if (!totpService.verifyCode(plainSecret, code)) {
            log.warn("2FA setup completion failed — wrong code for userId={}", userId);
            throw new InvalidCredentialsException("Invalid authenticator code. Make sure your phone clock is synced.");
        }

        List<String> rawCodes = generateBackupCodes();
        String hashedCodes = rawCodes.stream()
                .map(c -> sha256(c.toUpperCase()))
                .collect(Collectors.joining(","));

        user.activateTotp(hashedCodes);
        user.completeAdmin2faSetup();
        userRepository.save(user);

        log.info("2FA setup completed for userId={} email={}", userId, user.getEmail().getValue());
        return new SetupCompleteBundle(tokenPairHelper.issue(user, ipAddress, userAgent), rawCodes);
    }

    private List<String> generateBackupCodes() {
        SecureRandom rng = new SecureRandom();
        List<String> codes = new ArrayList<>(BACKUP_CODE_COUNT);
        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            StringBuilder sb = new StringBuilder(BACKUP_CODE_LENGTH);
            for (int j = 0; j < BACKUP_CODE_LENGTH; j++)
                sb.append(BACKUP_CODE_CHARS.charAt(rng.nextInt(BACKUP_CODE_CHARS.length())));
            codes.add(sb.toString());
        }
        return codes;
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
