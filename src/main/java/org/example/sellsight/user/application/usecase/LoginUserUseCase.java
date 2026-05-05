package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.config.security.TokenPairHelper;
import org.example.sellsight.user.application.dto.LoginOutcome;
import org.example.sellsight.user.application.dto.LoginRequest;
import org.example.sellsight.user.domain.exception.AccountDeletedException;
import org.example.sellsight.user.domain.exception.AccountDisabledException;
import org.example.sellsight.user.domain.exception.Admin2faSetupPendingException;
import org.example.sellsight.user.domain.exception.EmailNotVerifiedException;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.exception.SellerApprovalRequiredException;
import org.example.sellsight.user.domain.model.AuthProvider;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.SellerStatus;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Slf4j
@Service
public class LoginUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenPairHelper tokenPairHelper;
    private final JwtService jwtService;

    @Value("${app.verification.bypass-emails:}")
    private String bypassEmailsRaw;

    public LoginUserUseCase(UserRepository userRepository,
                             PasswordEncoder passwordEncoder,
                             TokenPairHelper tokenPairHelper,
                             JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenPairHelper = tokenPairHelper;
        this.jwtService = jwtService;
    }

    public LoginOutcome execute(LoginRequest request, String ipAddress, String userAgent) {
        log.info("Login attempt for email={}", request.email());
        Email email = new Email(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Login failed — user not found: {}", request.email());
                    return new InvalidCredentialsException();
                });

        if (user.isDeleted()) {
            log.warn("Login blocked — account deleted: {}", request.email());
            throw new AccountDeletedException();
        }

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            log.warn("Login rejected — OAuth account tried password login: {} provider={}", request.email(), user.getAuthProvider());
            throw new InvalidCredentialsException(
                    "This account uses " + user.getAuthProvider().name() + " sign-in. Please use that method instead.");
        }

        if (user.isDisabled()) {
            log.warn("Login blocked — account disabled: {}", request.email());
            throw new AccountDisabledException();
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword().getHashedValue())) {
            log.warn("Login failed — wrong password for email={}", request.email());
            throw new InvalidCredentialsException();
        }

        boolean whitelisted = Arrays.stream(bypassEmailsRaw.split(","))
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .anyMatch(e -> e.equalsIgnoreCase(user.getEmail().getValue()));

        if (!user.isEmailVerified() && !whitelisted) {
            log.warn("Login blocked — email not verified: {}", request.email());
            throw new EmailNotVerifiedException();
        }

        SellerStatus sellerStatus = user.getSellerStatus();
        if (sellerStatus == SellerStatus.PENDING || sellerStatus == SellerStatus.REJECTED) {
            log.warn("Login blocked — seller not approved: {} status={}", request.email(), sellerStatus);
            throw new SellerApprovalRequiredException(sellerStatus);
        }

        log.info("Login successful for email={} role={}", user.getEmail().getValue(), user.getRole());

        if (whitelisted && !user.isEmailVerified()) {
            user.markEmailVerified();
        }

        boolean isPrivileged = (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN);

        if (!isPrivileged) {
            return new LoginOutcome.Success(tokenPairHelper.issue(user, ipAddress, userAgent));
        }

        // Privileged: ADMIN or SUPER_ADMIN
        if (user.isTotpEnabled()) {
            String challengeToken = jwtService.generateChallengeToken(user.getId().getValue());
            log.info("2FA challenge issued for {} email={}", user.getRole(), user.getEmail().getValue());
            return new LoginOutcome.Requires2fa(challengeToken, user.getFirstName());
        }

        if (user.isAdmin2faSetupRequired()) {
            if (!user.isAdmin2faSetupApproved()) {
                log.warn("Login blocked — 2FA setup not approved for email={}", user.getEmail().getValue());
                throw new Admin2faSetupPendingException();
            }
            String setupToken = jwtService.generateSetupToken(user.getId().getValue());
            log.info("2FA setup token issued for {} email={}", user.getRole(), user.getEmail().getValue());
            return new LoginOutcome.Requires2faSetup(setupToken, user.getFirstName());
        }

        // setupRequired=false: legacy admin or first-boot SUPER_ADMIN without new 2FA requirement
        return new LoginOutcome.Success(tokenPairHelper.issue(user, ipAddress, userAgent));
    }
}
