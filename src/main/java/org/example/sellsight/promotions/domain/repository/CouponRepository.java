package org.example.sellsight.promotions.domain.repository;

import org.example.sellsight.promotions.domain.model.Coupon;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CouponRepository {
    Coupon save(Coupon coupon);
    Optional<Coupon> findById(UUID id);
    Optional<Coupon> findByCode(String code);
    List<Coupon> findAll();
    void deleteById(UUID id);
}
