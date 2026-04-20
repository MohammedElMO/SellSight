package org.example.sellsight.loyalty.infrastructure.persistence.repository;

import org.example.sellsight.loyalty.domain.model.LoyaltyAccount;
import org.example.sellsight.loyalty.domain.model.LoyaltyTransaction;
import org.example.sellsight.loyalty.domain.model.Tier;
import org.example.sellsight.loyalty.domain.model.TransactionType;
import org.example.sellsight.loyalty.domain.repository.LoyaltyRepository;
import org.example.sellsight.loyalty.infrastructure.persistence.entity.LoyaltyAccountJpaEntity;
import org.example.sellsight.loyalty.infrastructure.persistence.entity.LoyaltyTransactionJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class LoyaltyRepositoryAdapter implements LoyaltyRepository {

    private final LoyaltyAccountJpaRepository accountJpa;
    private final LoyaltyTransactionJpaRepository txJpa;

    public LoyaltyRepositoryAdapter(LoyaltyAccountJpaRepository accountJpa,
                                     LoyaltyTransactionJpaRepository txJpa) {
        this.accountJpa = accountJpa;
        this.txJpa = txJpa;
    }

    @Override
    public LoyaltyAccount save(LoyaltyAccount a) {
        var entity = new LoyaltyAccountJpaEntity();
        entity.setUserId(a.getUserId());
        entity.setBalance(a.getBalance());
        entity.setLifetimeSpend(a.getLifetimeSpend());
        entity.setTier(a.getTier().name());
        entity.setReferralCode(a.getReferralCode());
        entity.setCreatedAt(a.getCreatedAt());
        var saved = accountJpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<LoyaltyAccount> findByUserId(String userId) {
        return accountJpa.findById(userId).map(this::toDomain);
    }

    @Override
    public LoyaltyTransaction saveTransaction(LoyaltyTransaction t) {
        var e = new LoyaltyTransactionJpaEntity();
        e.setId(t.id());
        e.setUserId(t.userId());
        e.setType(t.type().name());
        e.setPoints(t.points());
        e.setDescription(t.description());
        e.setOrderId(t.orderId());
        e.setCreatedAt(t.createdAt());
        var saved = txJpa.save(e);
        return txToDomain(saved);
    }

    @Override
    public List<LoyaltyTransaction> findTransactionsByUserId(String userId) {
        return txJpa.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::txToDomain).toList();
    }

    @Override
    public Optional<LoyaltyAccount> findByReferralCode(String code) {
        return accountJpa.findByReferralCode(code).map(this::toDomain);
    }

    private LoyaltyAccount toDomain(LoyaltyAccountJpaEntity e) {
        return new LoyaltyAccount(
                e.getUserId(), e.getBalance(), e.getLifetimeSpend(),
                Tier.valueOf(e.getTier()), e.getReferralCode(), e.getCreatedAt()
        );
    }

    private LoyaltyTransaction txToDomain(LoyaltyTransactionJpaEntity e) {
        return new LoyaltyTransaction(
                e.getId(), e.getUserId(), TransactionType.valueOf(e.getType()),
                e.getPoints(), e.getDescription(), e.getOrderId(), e.getCreatedAt()
        );
    }
}
