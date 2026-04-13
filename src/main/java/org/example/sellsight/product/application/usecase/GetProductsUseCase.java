package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.ProductPageDto;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Use case: Get paginated product listing.
 */
@Service
public class GetProductsUseCase {

    private final ProductRepository productRepository;

    public GetProductsUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductPageDto execute(int page, int size) {
        List<Product> products = productRepository.findAll(page, size);
        long total = productRepository.count();
        return toPageDto(products, page, size, total);
    }

    public ProductPageDto executeBySeller(String sellerId, int page, int size) {
        List<Product> products = productRepository.findBySellerId(sellerId, page, size);
        long total = productRepository.countBySellerId(sellerId);
        return toPageDto(products, page, size, total);
    }

    private ProductPageDto toPageDto(List<Product> products, int page, int size, long total) {
        List<ProductDto> dtos = products.stream().map(this::toDto).toList();
        int totalPages = (int) Math.ceil((double) total / size);
        return new ProductPageDto(dtos, page, size, total, totalPages);
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.isActive(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
