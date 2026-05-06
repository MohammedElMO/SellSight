package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminUserDto;
import org.example.sellsight.user.domain.exception.SuperAdminProtectedException;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChangeUserRoleUseCase {

    private final UserRepository userRepository;

    @Transactional
    public AdminUserDto execute(String userId, String newRoleStr) {
        Role newRole;
        try {
            newRole = Role.valueOf(newRoleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + newRoleStr);
        }

        // Block promoting to privileged roles via the admin user endpoint
        if (newRole == Role.SUPER_ADMIN) {
            throw new SuperAdminProtectedException("promote users to SUPER_ADMIN");
        }
        if (newRole == Role.ADMIN) {
            throw new IllegalStateException("Promoting users to ADMIN must be done via the Super Admin panel.");
        }

        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Block changing the role of privileged accounts via this endpoint
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new SuperAdminProtectedException("change the role of");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Admin account roles must be managed via the Super Admin panel.");
        }

        user.changeRole(newRole);
        var saved = userRepository.save(user);
        return ListAdminUsersUseCase.toDto(saved, 0L);
    }
}
