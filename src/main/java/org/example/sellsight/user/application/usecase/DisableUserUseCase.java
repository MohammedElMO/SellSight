package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DisableUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        if (user.getRole().name().equals("ADMIN")) {
            throw new IllegalStateException("Cannot disable an admin account");
        }
        user.disable();
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
