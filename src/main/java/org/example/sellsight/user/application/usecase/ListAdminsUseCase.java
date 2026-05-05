package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminManagementDto;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListAdminsUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public List<AdminManagementDto> execute() {
        return userRepository.findPrivilegedUsers().stream()
                .map(u -> toDto(u, refreshTokenRepository.findActiveByUserId(u.getId().getValue()).size()))
                .toList();
    }

    public static AdminManagementDto toDto(User u, long activeSessionCount) {
        return new AdminManagementDto(
                u.getId().getValue(),
                u.getEmail().getValue(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole().name(),
                u.isDisabled(),
                u.isDeleted(),
                u.isTotpEnabled(),
                u.isAdmin2faSetupRequired(),
                u.isAdmin2faSetupApproved(),
                u.isAdmin2faResetRequired(),
                u.getFailed2faAttempts(),
                u.getLast2faVerifiedAt() != null ? u.getLast2faVerifiedAt().toString() : null,
                u.getCreatedAt().toString(),
                activeSessionCount
        );
    }
}
