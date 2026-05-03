package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RevokeFamilyUseCase {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(String familyId) {
        refreshTokenRepository.revokeAllByFamilyId(familyId);
    }
}
