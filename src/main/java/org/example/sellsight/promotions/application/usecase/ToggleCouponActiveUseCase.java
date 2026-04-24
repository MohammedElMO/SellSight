package org.example.sellsight.promotions.application.usecase;

import org.example.sellsight.promotions.application.dto.AdminCouponDto;
import org.example.sellsight.promotions.domain.model.Coupon;
import org.example.sellsight.promotions.domain.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ToggleCouponActiveUseCase {

    private final CouponRepository couponRepository;

    public ToggleCouponActiveUseCase(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public AdminCouponDto execute(String id, boolean active) {
        Coupon coupon = couponRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));
        if (active) coupon.activate();
        else        coupon.deactivate();
        Coupon saved = couponRepository.save(coupon);
        return toDto(saved);
    }

    private AdminCouponDto toDto(Coupon c) {
        return new AdminCouponDto(
                c.getId().toString(), c.getCode(), c.getType().name(),
                c.getValue(), c.getMinOrder(), c.getMaxUses(), c.getUsedCount(),
                c.getStartsAt(), c.getExpiresAt(), c.isActive()
        );
    }
}
