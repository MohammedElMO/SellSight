package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.events.EventPublisher;
import org.example.sellsight.user.application.event.PasswordChanged;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.Password;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.kafka.topics.user-events:user-events}")
    private String userEventsTopic;

    @Transactional
    public void execute(String authenticatedEmail, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(new Email(authenticatedEmail))
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.getPassword() == null) {
            throw new InvalidCredentialsException("OAuth accounts cannot change password here");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword().getHashedValue())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.changePassword(new Password(passwordEncoder.encode(newPassword)));
        userRepository.save(user);

        // Revoke all refresh tokens so other devices are logged out after password change
        refreshTokenRepository.revokeAllByUserId(user.getId().getValue());

        eventPublisher.publish(userEventsTopic,
                new PasswordChanged(user.getId().getValue(), user.getEmail().getValue()));
    }
}
