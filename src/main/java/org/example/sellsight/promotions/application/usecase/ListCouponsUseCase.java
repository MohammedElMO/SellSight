package org.example.sellsight.promotions.application.usecase;

import org.example.sellsight.promotions.application.dto.AdminCouponDto;
import org.example.sellsight.promotions.domain.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListCouponsUseCase {

    private final CouponRepository couponRepository;

    public ListCouponsUseCase(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<AdminCouponDto> execute() {
        return couponRepository.findAll().stream()
                .map(c -> new AdminCouponDto(
                        c.getId().toString(),
                        c.getCode(),
                        c.getType().name(),
                        c.getValue(),
                        c.getMinOrder(),
                        c.getMaxUses(),
                        c.getUsedCount(),
                        c.getStartsAt(),
                        c.getExpiresAt(),
                        c.isActive()
                ))
                .toList();
    }
}
