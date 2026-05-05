package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.TotpService;
import org.example.sellsight.user.domain.exception.InvalidCredentialsException;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class Disable2faUseCase {

    private final UserRepository userRepository;
    private final TotpService totpService;

    public void execute(String email, String code) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isTotpEnabled()) {
            throw new IllegalStateException("2FA is not enabled on this account.");
        }

        String plainSecret = totpService.decryptSecret(user.getTotpSecret());
        if (!totpService.verifyCode(plainSecret, code)) {
            log.warn("2FA disable failed — wrong code for email={}", email);
            throw new InvalidCredentialsException("Invalid authenticator code.");
        }

        user.disableTotp();
        userRepository.save(user);
        log.info("2FA disabled for email={}", email);
    }
}
