package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RejectSeller {

    private final UserRepository userRepository;

    public RejectSeller(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void execute(String sellerId) {
        var user = userRepository.findById(UserId.from(sellerId))
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + sellerId));
        user.rejectAsSeller();
        userRepository.save(user);
    }
}
