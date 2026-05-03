package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RestoreUserUseCase {

    private final UserRepository userRepository;

    @Transactional
    public void execute(String userId) {
        var user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.restore();
        userRepository.save(user);
    }
}
