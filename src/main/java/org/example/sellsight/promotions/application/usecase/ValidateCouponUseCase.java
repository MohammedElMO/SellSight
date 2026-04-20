package org.example.sellsight.promotions.application.usecase;

import org.example.sellsight.promotions.application.dto.CouponDto;
import org.example.sellsight.promotions.domain.model.Coupon;
import org.example.sellsight.promotions.domain.repository.CouponRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Validates a coupon code against an order subtotal and returns the discount.
 */
@Component
public class ValidateCouponUseCase {

    private final CouponRepository couponRepository;

    public ValidateCouponUseCase(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public CouponDto execute(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));

        coupon.validate(subtotal);
        BigDecimal discount = coupon.calculateDiscount(subtotal);

        return new CouponDto(
                coupon.getId().toString(),
                coupon.getCode(),
                coupon.getType().name(),
                coupon.getValue(),
                coupon.getMinOrder(),
                discount
        );
    }
}
