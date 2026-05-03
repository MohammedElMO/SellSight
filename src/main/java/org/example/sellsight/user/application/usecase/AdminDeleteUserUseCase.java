package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminDeleteUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId, String requestingAdminEmail) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Cannot delete an admin account");
        }
        if (user.getEmail().getValue().equalsIgnoreCase(requestingAdminEmail)) {
            throw new IllegalStateException("Cannot delete your own account");
        }

        user.softDelete(LocalDateTime.now());
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
