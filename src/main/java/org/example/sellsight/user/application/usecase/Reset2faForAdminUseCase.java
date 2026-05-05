package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class Reset2faForAdminUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new IllegalArgumentException("User is not an admin.");
        }

        user.resetAdmin2fa();     // disables TOTP, sets setupRequired=true, approved=false, resetRequired=true
        user.approveAdmin2faReset(); // SUPER_ADMIN auto-approves
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(userId);

        log.info("SUPER_ADMIN reset 2FA for userId={}", userId);
    }
}
