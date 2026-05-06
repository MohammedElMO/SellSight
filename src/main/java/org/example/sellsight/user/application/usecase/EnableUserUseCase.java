package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.exception.SuperAdminProtectedException;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnableUserUseCase {

    private final UserRepository userRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new SuperAdminProtectedException("enable");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Admin accounts cannot be enabled via this endpoint. Use the Super Admin panel.");
        }
        user.enable();
        userRepository.save(user);
    }
}
