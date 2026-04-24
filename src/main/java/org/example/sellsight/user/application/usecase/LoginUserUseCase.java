package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.LoginRequest;
import org.example.sellsight.user.domain.exception.EmailNotVerifiedException;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.exception.SellerApprovalRequiredException;
import org.example.sellsight.user.domain.model.SellerStatus;
import org.example.sellsight.user.domain.model.AuthProvider;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * Use case: Authenticate a user and return a JWT.
 */
@Slf4j
@Service
public class LoginUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.verification.bypass-emails:}")
    private String bypassEmailsRaw;

    public LoginUserUseCase(UserRepository userRepository,
                             PasswordEncoder passwordEncoder,
                             JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse execute(LoginRequest request) {
        log.info("Login attempt for email={}", request.email());
        Email email = new Email(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Login failed — user not found: {}", request.email());
                    return new InvalidCredentialsException();
                });

        // OAuth users cannot sign in with a password
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            log.warn("Login rejected — OAuth account tried password login: {} provider={}", request.email(), user.getAuthProvider());
            throw new InvalidCredentialsException(
                    "This account uses " + user.getAuthProvider().name() + " sign-in. Please use that method instead.");
        }

        // Verify password
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
        String sellerStatusStr = sellerStatus != null ? sellerStatus.name() : null;
        String token = jwtService.generateToken(user.getEmail().getValue(), user.getRole().name(), user.isEmailVerified() || whitelisted, sellerStatusStr);

        return new AuthResponse(
                token,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.isEmailVerified() || whitelisted,
                sellerStatusStr
        );
    }
}
