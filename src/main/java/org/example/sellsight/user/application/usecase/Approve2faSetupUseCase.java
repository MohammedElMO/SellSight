package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class Approve2faSetupUseCase {

    private final UserRepository userRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!user.isAdmin2faSetupRequired()) {
            throw new IllegalStateException("No pending 2FA setup for this user.");
        }

        user.approveAdmin2faSetup();
        userRepository.save(user);
        log.info("SUPER_ADMIN approved 2FA setup for userId={}", userId);
    }
}
