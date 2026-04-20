package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Use case: Soft-delete the authenticated user's account (GDPR).
 */
@Slf4j
@Service
public class DeleteAccountUseCase {

    private final UserRepository userRepository;

    public DeleteAccountUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void execute(String email) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isDeleted()) {
            throw new IllegalStateException("Account already deleted");
        }

        user.softDelete(LocalDateTime.now());
        userRepository.save(user);
    }
}
