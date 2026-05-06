package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminUserDto;
import org.example.sellsight.user.domain.exception.InvalidTokenException;
import org.example.sellsight.user.domain.exception.SuperAdminProtectedException;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetAdminUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public AdminUserDto execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new InvalidTokenException("User not found"));
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new SuperAdminProtectedException("view details of");
        }
        long activeSessions = refreshTokenRepository.findActiveByUserId(userId).size();
        return ListAdminUsersUseCase.toDto(user, activeSessions);
    }
}
