package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin: list sessions for a specific user.
 */
@Service
@RequiredArgsConstructor
public class ListUserSessionsUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public List<SessionDto> execute(String userId) {
        String email = userRepository.findById(UserId.from(userId))
                .map(u -> u.getEmail().getValue())
                .orElse(null);

        return refreshTokenRepository.findByUserId(userId)
                .stream()
                .map(rt -> ListMySessionsUseCase.toDto(rt, email))
                .toList();
    }
}
