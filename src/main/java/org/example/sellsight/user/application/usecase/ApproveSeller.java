package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApproveSeller {

    private final UserRepository userRepository;

    public ApproveSeller(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void execute(String sellerId) {
        var user = userRepository.findById(UserId.from(sellerId))
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + sellerId));
        user.approveAsSeller();
        userRepository.save(user);
    }
}
