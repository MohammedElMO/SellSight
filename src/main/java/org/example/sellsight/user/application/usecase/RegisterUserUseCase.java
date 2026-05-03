package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.TokenPairHelper;
import org.example.sellsight.shared.events.EventPublisher;
import org.example.sellsight.user.application.dto.AuthBundle;
import org.example.sellsight.user.application.dto.RegisterRequest;
import org.example.sellsight.user.application.event.UserRegistered;
import org.example.sellsight.user.domain.exception.UserAlreadyExistsException;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Service
public class RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenPairHelper tokenPairHelper;
    private final SendVerificationEmailUseCase sendVerificationEmail;
    private final EventPublisher eventPublisher;
    private final String userEventsTopic;

    @Value("${app.verification.bypass-emails:}")
    private String bypassEmailsRaw;

    public RegisterUserUseCase(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               TokenPairHelper tokenPairHelper,
                               SendVerificationEmailUseCase sendVerificationEmail,
                               EventPublisher eventPublisher,
                               @Value("${app.kafka.topics.user-events:user-events}") String userEventsTopic) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenPairHelper = tokenPairHelper;
        this.sendVerificationEmail = sendVerificationEmail;
        this.eventPublisher = eventPublisher;
        this.userEventsTopic = userEventsTopic;
    }

    @Transactional
    public AuthBundle execute(RegisterRequest request, String ipAddress, String userAgent) {
        log.info("Register attempt for email={} role={}", request.email(), request.role());
        Email email = new Email(request.email());

        Role role = Role.CUSTOMER;
        if (request.role() != null && !request.role().isBlank()) {
            try {
                Role parsed = Role.valueOf(request.role().toUpperCase());
                if (parsed == Role.ADMIN) {
                    throw new IllegalArgumentException("Self-registration as ADMIN is not permitted");
                }
                role = parsed;
            } catch (IllegalArgumentException e) {
                if (e.getMessage() != null && e.getMessage().contains("ADMIN")) throw e;
                role = Role.CUSTOMER;
            }
        }

        boolean whitelisted = Arrays.stream(bypassEmailsRaw.split(","))
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .anyMatch(e -> e.equalsIgnoreCase(request.email()));

        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean isSellerReapply = role == Role.SELLER
                    && user.getRole() == Role.SELLER
                    && user.getSellerStatus() == SellerStatus.REJECTED
                    && !user.isDeleted();

            if (!isSellerReapply) {
                log.warn("Registration rejected — email already exists: {}", request.email());
                throw new UserAlreadyExistsException(request.email());
            }

            user.updateProfile(request.firstName(), request.lastName());
            user.changePassword(new Password(passwordEncoder.encode(request.password())));
            user.markSellerPending();
            if (whitelisted) {
                user.markEmailVerified();
            }
            user = userRepository.save(user);
            log.info("Seller reapplied: id={} email={} whitelisted={}", user.getId().getValue(), user.getEmail().getValue(), whitelisted);

            if (!user.isEmailVerified() && !whitelisted) {
                sendVerificationEmail.execute(user);
            }

            return tokenPairHelper.issue(user, ipAddress, userAgent);
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        Password password = new Password(hashedPassword);

        User user = new User(
                UserId.generate(),
                request.firstName(),
                request.lastName(),
                email,
                password,
                role,
                LocalDateTime.now()
        );

        if (whitelisted) {
            user.markEmailVerified();
        }

        if (role == Role.SELLER) {
            user.markSellerPending();
        }

        user = userRepository.save(user);
        log.info("User registered: id={} email={} role={} whitelisted={}", user.getId().getValue(), user.getEmail().getValue(), user.getRole(), whitelisted);

        if (!whitelisted) {
            sendVerificationEmail.execute(user);
        }

        eventPublisher.publish(userEventsTopic,
                new UserRegistered(user.getId().getValue(), user.getEmail().getValue(), user.getRole().name()));

        return tokenPairHelper.issue(user, ipAddress, userAgent);
    }
}
