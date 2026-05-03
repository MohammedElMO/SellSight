package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.domain.model.RefreshToken;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Returns all sessions (refresh tokens) for the authenticated user.
 */
@Service
@RequiredArgsConstructor
public class ListMySessionsUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    public List<SessionDto> execute(String userId) {
        return refreshTokenRepository.findByUserId(userId)
                .stream()
                .map(rt -> toDto(rt, null))
                .toList();
    }

    static SessionDto toDto(RefreshToken rt, String userEmail) {
        String status;
        if (rt.getRevokedAt() != null) {
            status = "REVOKED";
        } else if (rt.getExpiresAt() != null && Instant.now().isAfter(rt.getExpiresAt())) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        return new SessionDto(
                rt.getId(),
                rt.getUserId(),
                userEmail,
                rt.getDeviceInfo(),
                rt.getIpAddress(),
                rt.getUserAgent(),
                rt.getCreatedAt(),
                rt.getLastUsedAt(),
                rt.getExpiresAt(),
                rt.getRevokedAt(),
                status,
                rt.getTokenFamilyId()
        );
    }
}
