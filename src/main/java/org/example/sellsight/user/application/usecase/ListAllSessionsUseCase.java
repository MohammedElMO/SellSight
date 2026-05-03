package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin: list sessions for all users.
 */
@Service
@RequiredArgsConstructor
public class ListAllSessionsUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public List<SessionDto> execute() {
        List<RefreshToken> all = userRepository.findAll()
                .stream()
                .flatMap(u -> refreshTokenRepository.findByUserId(u.getId().getValue()).stream())
                .toList();

        return all.stream()
                .map(rt -> {
                    String email = userRepository.findById(UserId.from(rt.getUserId()))
                            .map(u -> u.getEmail().getValue())
                            .orElse(null);
                    return ListMySessionsUseCase.toDto(rt, email);
                })
                .toList();
    }
}
