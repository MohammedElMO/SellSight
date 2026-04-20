package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ResendVerificationUseCase {

    private final UserRepository userRepository;
    private final SendVerificationEmailUseCase sender;

    public void execute(String rawEmail) {
        Optional<User> maybe = userRepository.findByEmail(new Email(rawEmail));
        // Do not reveal whether the email exists — always return the same response.
        maybe.filter(u -> !u.isEmailVerified() && !u.isDeleted())
             .ifPresent(sender::execute);
    }
}
