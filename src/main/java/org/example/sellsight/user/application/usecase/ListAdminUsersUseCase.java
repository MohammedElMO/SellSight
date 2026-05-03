package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminUserDto;
import org.example.sellsight.user.application.dto.AdminUserPageDto;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListAdminUsersUseCase {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminUserPageDto execute(String search, String roleStr, String status, int page, int size, String sort) {
        Role role = (roleStr != null && !roleStr.isBlank() && !"ALL".equals(roleStr))
                ? Role.valueOf(roleStr.toUpperCase())
                : null;

        Sort ordering = switch (sort == null ? "newest" : sort) {
            case "oldest"   -> Sort.by(Sort.Direction.ASC,  "createdAt");
            case "email"    -> Sort.by(Sort.Direction.ASC,  "email");
            case "role"     -> Sort.by(Sort.Direction.ASC,  "role");
            default         -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(page, size, ordering);
        Page<User> result = userRepository.findAllForAdmin(
                search == null || search.isBlank() ? null : search,
                role,
                status,
                pageable
        );

        java.util.List<AdminUserDto> dtos = result.getContent().stream()
                .map(u -> toDto(u, 0L))
                .toList();

        return new AdminUserPageDto(dtos, result.getTotalElements(), page, size, result.getTotalPages());
    }

    static AdminUserDto toDto(User u, long activeSessionCount) {
        return new AdminUserDto(
                u.getId().getValue(),
                u.getEmail().getValue(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole().name(),
                u.getCreatedAt(),
                u.getAvatarUrl(),
                u.isEmailVerified(),
                u.getSellerStatus() != null ? u.getSellerStatus().name() : null,
                u.getAuthProvider().name(),
                u.isDisabled(),
                u.isDeleted(),
                u.getDeletedAt(),
                activeSessionCount
        );
    }
}
