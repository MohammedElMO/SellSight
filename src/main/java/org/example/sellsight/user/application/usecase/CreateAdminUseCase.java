package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.CreateAdminRequest;
import org.example.sellsight.user.domain.exception.UserAlreadyExistsException;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class CreateAdminUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CreateAdminUseCase(UserRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse execute(CreateAdminRequest request) {
        Email email = new Email(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(request.email());
        }

        User admin = new User(
                UserId.generate(),
                request.firstName(),
                request.lastName(),
                email,
                new Password(passwordEncoder.encode(request.password())),
                Role.ADMIN,
                LocalDateTime.now()
        );
        admin.markEmailVerified();
        User saved = userRepository.save(admin);
        log.info("Admin account created: id={} email={}", saved.getId().getValue(), saved.getEmail().getValue());

        String token = jwtService.generateToken(
                saved.getEmail().getValue(), saved.getRole().name(), true, null);
        return new AuthResponse(
                token, saved.getEmail().getValue(), saved.getRole().name(),
                saved.getFirstName(), saved.getLastName(), true, null);
    }
}
