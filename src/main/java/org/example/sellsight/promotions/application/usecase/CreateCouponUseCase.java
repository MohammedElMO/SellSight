package org.example.sellsight.promotions.application.usecase;

import org.example.sellsight.promotions.application.dto.AdminCouponDto;
import org.example.sellsight.promotions.application.dto.CreateCouponRequest;
import org.example.sellsight.promotions.domain.model.Coupon;
import org.example.sellsight.promotions.domain.model.CouponType;
import org.example.sellsight.promotions.domain.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CreateCouponUseCase {

    private final CouponRepository couponRepository;

    public CreateCouponUseCase(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public AdminCouponDto execute(CreateCouponRequest req) {
        Coupon coupon = new Coupon(
                UUID.randomUUID(),
                req.code(),
                CouponType.valueOf(req.type()),
                req.value(),
                req.minOrder() != null ? req.minOrder() : BigDecimal.ZERO,
                req.maxUses(),
                0,
                req.startsAt(),
                req.expiresAt(),
                true
        );
        Coupon saved = couponRepository.save(coupon);
        return new AdminCouponDto(
                saved.getId().toString(),
                saved.getCode(),
                saved.getType().name(),
                saved.getValue(),
                saved.getMinOrder(),
                saved.getMaxUses(),
                saved.getUsedCount(),
                saved.getStartsAt(),
                saved.getExpiresAt(),
                saved.isActive()
        );
    }
}
