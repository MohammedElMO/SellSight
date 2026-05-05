package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.TotpService;
import org.example.sellsight.user.application.dto.TotpSetupResponse;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.Password;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * First step of the bootstrap flow for a newly seeded SUPER_ADMIN (or any admin with
 * forcePasswordChange=true). Validates the setup token, changes the temporary password,
 * clears the forcePasswordChange flag, generates an encrypted TOTP secret, and returns
 * the QR code + plain secret so the user can scan immediately.
 *
 * The plain secret is shown ONCE here — it is never returned again. After this call
 * the user must call /2fa-setup/complete to finish.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BootstrapPasswordChangeUseCase {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final PasswordEncoder passwordEncoder;

    public TotpSetupResponse execute(String setupToken, String newPassword) {
        String userId = jwtService.extractUserIdFromSetupToken(setupToken);
        if (userId == null) throw new InvalidCredentialsException("Invalid or expired setup token.");

        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid setup token."));

        if (user.isDeleted() || user.isDisabled())
            throw new InvalidCredentialsException("Account unavailable.");

        if (!user.isForcePasswordChange())
            throw new InvalidCredentialsException("Password change is not required for this account.");

        if (user.isTotpEnabled() || !user.isAdmin2faSetupRequired())
            throw new InvalidCredentialsException("Setup token is no longer valid.");

        // Change temporary password
        user.changePassword(new Password(passwordEncoder.encode(newPassword)));
        user.clearForcePasswordChange();

        // Generate TOTP secret (encrypted) — plain returned once for QR display
        String plainSecret     = totpService.generateSecret();
        String encryptedSecret = totpService.encryptSecret(plainSecret);
        user.setupTotpPending(encryptedSecret);

        userRepository.save(user);
        log.info("Bootstrap password changed and 2FA setup initiated for userId={} email={}",
                userId, user.getEmail().getValue());

        return new TotpSetupResponse(false,
                totpService.generateQrCodeBase64(plainSecret, user.getEmail().getValue()),
                plainSecret);
    }
}
