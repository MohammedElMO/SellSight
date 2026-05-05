package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.TotpService;
import org.example.sellsight.user.application.dto.TotpSetupResponse;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class Initiate2faSetupUseCase {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TotpService totpService;

    public TotpSetupResponse execute(String setupToken) {
        String userId = jwtService.extractUserIdFromSetupToken(setupToken);
        if (userId == null) throw new InvalidCredentialsException("Invalid or expired setup token.");

        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid setup token."));

        if (user.isDeleted() || user.isDisabled())
            throw new InvalidCredentialsException("Account unavailable.");

        if (user.isTotpEnabled() || !user.isAdmin2faSetupRequired())
            throw new InvalidCredentialsException("Setup token is no longer valid.");

        // Bootstrap: must change temporary password before 2FA setup
        if (user.isForcePasswordChange()) {
            log.info("2FA setup blocked — password change required for userId={}", userId);
            return new TotpSetupResponse(true, null, null);
        }

        // Secret already generated (e.g. user navigated away after /bootstrap/change-password)
        // — don't regenerate, signal frontend to proceed to the code-entry step
        if (user.getTotpSecret() != null) {
            log.info("2FA setup already in progress (secret set), skipping generation for userId={}", userId);
            return new TotpSetupResponse(false, null, null);
        }

        // Normal path: generate encrypted secret, persist, return QR
        String plainSecret = totpService.generateSecret();
        String encryptedSecret = totpService.encryptSecret(plainSecret);
        user.setupTotpPending(encryptedSecret);
        userRepository.save(user);

        log.info("2FA setup initiated via setup token for userId={}", userId);
        return new TotpSetupResponse(false,
                totpService.generateQrCodeBase64(plainSecret, user.getEmail().getValue()),
                plainSecret);
    }
}
