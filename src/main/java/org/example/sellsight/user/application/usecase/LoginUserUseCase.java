package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.LoginRequest;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.AuthProvider;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Use case: Authenticate a user and return a JWT.
 */
@Slf4j
@Service
public class LoginUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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

        log.info("Login successful for email={} role={}", user.getEmail().getValue(), user.getRole());
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
