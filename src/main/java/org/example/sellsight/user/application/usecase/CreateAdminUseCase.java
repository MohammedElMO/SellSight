package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.application.dto.AdminManagementDto;
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

    public CreateAdminUseCase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminManagementDto execute(CreateAdminRequest request) {
        Email email = new Email(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(request.email());
        }

        User admin = new User(
                UserId.generate(),
                request.firstName(),
                request.lastName(),
                email,
                new Password(passwordEncoder.encode(request.tempPassword())),
                Role.ADMIN,
                LocalDateTime.now()
        );
        admin.markEmailVerified();
        admin.requireAdmin2faSetup();
        admin.approveAdmin2faSetup();    // auto-approved at creation by SUPER_ADMIN
        admin.requirePasswordChange();   // must change temp password before 2FA setup

        User saved = userRepository.save(admin);
        log.info("Admin account created by SUPER_ADMIN: id={} email={}", saved.getId().getValue(), saved.getEmail().getValue());

        return ListAdminsUseCase.toDto(saved, 0L);
    }
}
