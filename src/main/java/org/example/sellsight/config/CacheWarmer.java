package org.example.sellsight.config;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.application.usecase.GetLandingUseCase;
import org.example.sellsight.product.application.usecase.GetProductsUseCase;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CacheWarmer implements ApplicationRunner {

    private final GetProductsUseCase getProductsUseCase;
    private final GetLandingUseCase getLandingUseCase;

    public CacheWarmer(GetProductsUseCase getProductsUseCase, GetLandingUseCase getLandingUseCase) {
        this.getProductsUseCase = getProductsUseCase;
        this.getLandingUseCase = getLandingUseCase;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Warming product caches...");
            getLandingUseCase.execute();         // product-landing
            getProductsUseCase.executeKeyset(null, 20); // product-listings (page 0, size 20)
            getProductsUseCase.executeKeyset(null, 16); // product-listings (page 0, size 16)
            log.info("Product cache warm-up complete.");
        } catch (Exception e) {
            log.warn("Cache warm-up failed (non-fatal): {}", e.getMessage());
        }
    }
}
