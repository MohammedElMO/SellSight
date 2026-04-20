package org.example.sellsight.promotions.infrastructure.persistence.repository;

import org.example.sellsight.promotions.domain.model.Coupon;
import org.example.sellsight.promotions.domain.model.CouponType;
import org.example.sellsight.promotions.domain.repository.CouponRepository;
import org.example.sellsight.promotions.infrastructure.persistence.entity.CouponJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CouponRepositoryAdapter implements CouponRepository {

    private final CouponJpaRepository jpa;

    public CouponRepositoryAdapter(CouponJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Coupon save(Coupon c) {
        var saved = jpa.save(toJpa(c));
        return toDomain(saved);
    }

    @Override
    public Optional<Coupon> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return jpa.findByCode(code).map(this::toDomain);
    }

    private CouponJpaEntity toJpa(Coupon c) {
        var e = new CouponJpaEntity();
        e.setId(c.getId());
        e.setCode(c.getCode());
        e.setType(c.getType().name());
        e.setValue(c.getValue());
        e.setMinOrder(c.getMinOrder());
        e.setMaxUses(c.getMaxUses());
        e.setUsedCount(c.getUsedCount());
        e.setStartsAt(c.getStartsAt());
        e.setExpiresAt(c.getExpiresAt());
        e.setActive(c.isActive());
        return e;
    }

    private Coupon toDomain(CouponJpaEntity e) {
        return new Coupon(
                e.getId(), e.getCode(), CouponType.valueOf(e.getType()),
                e.getValue(), e.getMinOrder(), e.getMaxUses(), e.getUsedCount(),
                e.getStartsAt(), e.getExpiresAt(), e.isActive()
        );
    }
}
