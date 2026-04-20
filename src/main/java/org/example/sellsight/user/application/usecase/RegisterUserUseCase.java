package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.shared.events.EventPublisher;
import org.example.sellsight.user.application.dto.AuthResponse;
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

@Slf4j
@Service
public class RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SendVerificationEmailUseCase sendVerificationEmail;
    private final EventPublisher eventPublisher;
    private final String userEventsTopic;

    public RegisterUserUseCase(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               JwtService jwtService,
                               SendVerificationEmailUseCase sendVerificationEmail,
                               EventPublisher eventPublisher,
                               @Value("${app.kafka.topics.user-events:user-events}") String userEventsTopic) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.sendVerificationEmail = sendVerificationEmail;
        this.eventPublisher = eventPublisher;
        this.userEventsTopic = userEventsTopic;
    }

    @Transactional
    public AuthResponse execute(RegisterRequest request) {
        log.info("Register attempt for email={} role={}", request.email(), request.role());
        Email email = new Email(request.email());

        if (userRepository.existsByEmail(email)) {
            log.warn("Registration rejected — email already exists: {}", request.email());
            throw new UserAlreadyExistsException(request.email());
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        Password password = new Password(hashedPassword);

        Role role = Role.CUSTOMER;
        if (request.role() != null && !request.role().isBlank()) {
            try {
                role = Role.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.CUSTOMER;
            }
        }

        User user = new User(
                UserId.generate(),
                request.firstName(),
                request.lastName(),
                email,
                password,
                role,
                LocalDateTime.now()
        );

        user = userRepository.save(user);
        log.info("User registered: id={} email={} role={}", user.getId().getValue(), user.getEmail().getValue(), user.getRole());

        sendVerificationEmail.execute(user);

        eventPublisher.publish(userEventsTopic,
                new UserRegistered(user.getId().getValue(), user.getEmail().getValue(), user.getRole().name()));

        String token = jwtService.generateToken(user.getEmail().getValue(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
