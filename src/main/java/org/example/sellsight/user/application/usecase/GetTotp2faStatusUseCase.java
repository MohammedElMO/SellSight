package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.TotpStatusResponse;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetTotp2faStatusUseCase {

    private final UserRepository userRepository;

    public TotpStatusResponse execute(String email) {
        return userRepository.findByEmail(new Email(email))
                .map(u -> new TotpStatusResponse(u.isTotpEnabled()))
                .orElseThrow(InvalidCredentialsException::new);
    }
}
