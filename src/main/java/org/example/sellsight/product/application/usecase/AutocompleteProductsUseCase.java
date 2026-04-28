package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.application.dto.AutocompleteDto;
import org.example.sellsight.product.infrastructure.persistence.repository.ProductJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class AutocompleteProductsUseCase {

    private final ProductJpaRepository repo;

    public AutocompleteProductsUseCase(ProductJpaRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<AutocompleteDto> execute(String query, int limit) {
        if (query == null || query.trim().length() < 2) return List.of();
        String q = query.trim();
        return repo.autocomplete(q, Math.min(limit, 20)).stream()
                .map(e -> new AutocompleteDto(e.getId(), e.getName(), e.getCategory(), e.getImageUrl(), e.getPrice()))
                .toList();
    }
}
