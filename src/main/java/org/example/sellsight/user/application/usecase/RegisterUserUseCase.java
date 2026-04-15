package org.example.sellsight.user.application.usecase;

import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.RegisterRequest;
import org.example.sellsight.user.domain.exception.UserAlreadyExistsException;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Use case: Register a new user.
 * Validates email uniqueness, hashes password, creates domain User, returns JWT.
 */
@Service
public class RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public RegisterUserUseCase(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse execute(RegisterRequest request) {
        Email email = new Email(request.email());

        // Check email uniqueness
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(request.email());
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(request.password());
        Password password = new Password(hashedPassword);

        // get role
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

        userRepository.save(user);

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
