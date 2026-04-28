package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.infrastructure.persistence.entity.BackInStockSubscriptionJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.repository.BackInStockSubscriptionJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ManageBackInStockSubscriptionUseCase {

    private final BackInStockSubscriptionJpaRepository repo;
    private final SendNotificationUseCase notificationUseCase;

    public ManageBackInStockSubscriptionUseCase(BackInStockSubscriptionJpaRepository repo,
                                                SendNotificationUseCase notificationUseCase) {
        this.repo = repo;
        this.notificationUseCase = notificationUseCase;
    }

    @Transactional
    public void subscribe(String userId, String productId) {
        if (!repo.existsByUserIdAndProductId(userId, productId)) {
            repo.save(new BackInStockSubscriptionJpaEntity(userId, productId, LocalDateTime.now()));
        }
    }

    @Transactional
    public void unsubscribe(String userId, String productId) {
        repo.deleteByUserIdAndProductId(userId, productId);
    }

    public boolean isSubscribed(String userId, String productId) {
        return repo.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void notifyAndClear(String productId, String productName) {
        List<BackInStockSubscriptionJpaEntity> subs = repo.findByProductId(productId);
        if (subs.isEmpty()) return;
        for (BackInStockSubscriptionJpaEntity sub : subs) {
            notificationUseCase.send(
                    sub.getUserId(),
                    "BACK_IN_STOCK",
                    "Back in stock!",
                    productName + " is now available. Grab it before it sells out."
            );
        }
        repo.deleteByProductId(productId);
    }
}
