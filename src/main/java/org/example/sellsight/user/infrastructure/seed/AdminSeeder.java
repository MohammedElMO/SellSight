package org.example.sellsight.user.infrastructure.seed;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
public class AdminSeeder implements ApplicationRunner {

    @Value("${app.initial-admin.email:}")
    private String email;

    @Value("${app.initial-admin.password:}")
    private String password;

    @Value("${app.initial-admin.first-name:Admin}")
    private String firstName;

    @Value("${app.initial-admin.last-name:System}")
    private String lastName;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank()) return;

        Email adminEmail = new Email(email);
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.debug("Admin already exists: {}", email);
            return;
        }

        User admin = new User(
                UserId.generate(),
                firstName,
                lastName,
                adminEmail,
                new Password(passwordEncoder.encode(password)),
                Role.ADMIN,
                LocalDateTime.now()
        );
        admin.markEmailVerified();
        userRepository.save(admin);
        log.info("Initial admin seeded: {}", email);
    }
}
