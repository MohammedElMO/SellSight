package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.domain.exception.InvalidTokenException;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetSessionUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SessionDto execute(String sessionId) {
        var token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new InvalidTokenException("Session not found"));
        String email = userRepository.findById(UserId.from(token.getUserId()))
                .map(u -> u.getEmail().getValue())
                .orElse(null);
        return ListMySessionsUseCase.toDto(token, email);
    }
}
