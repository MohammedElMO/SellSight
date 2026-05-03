package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminUserDto;
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

        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.changeRole(newRole);
        var saved = userRepository.save(user);
        return ListAdminUsersUseCase.toDto(saved, 0L);
    }
}
