package org.example.sellsight.product.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.product.application.dto.LandingDto;
import org.example.sellsight.product.application.dto.ProductDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetLandingUseCase {

    private final GetProductsUseCase getProductsUseCase;

    @Cacheable(value = "product-landing", sync = true)
    @Transactional(readOnly = true)
    public LandingDto execute() {
        List<ProductDto> popular = getProductsUseCase.executeKeyset(null, 20).products();
        // newArrivals = first 8 of popular (same newest sort, avoids a second query)
        List<ProductDto> newArrivals = popular.size() >= 8 ? popular.subList(0, 8) : popular;
        List<ProductDto> trending = getProductsUseCase
                .executeWithFilters(null, null, null, null, null, "best_selling", 0, 8)
                .products();
        return new LandingDto(popular, newArrivals, trending);
    }
}
