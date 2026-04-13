package org.example.sellsight.product.infrastructure.web;

import jakarta.validation.Valid;
import org.example.sellsight.product.application.dto.*;
import org.example.sellsight.product.application.usecase.*;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for product CRUD operations.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final CreateProductUseCase createProductUseCase;
    private final UpdateProductUseCase updateProductUseCase;
    private final DeleteProductUseCase deleteProductUseCase;
    private final GetProductsUseCase getProductsUseCase;
    private final GetProductByIdUseCase getProductByIdUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public ProductController(CreateProductUseCase createProductUseCase,
                              UpdateProductUseCase updateProductUseCase,
                              DeleteProductUseCase deleteProductUseCase,
                              GetProductsUseCase getProductsUseCase,
                              GetProductByIdUseCase getProductByIdUseCase,
                              GetUserProfileUseCase getUserProfileUseCase) {
        this.createProductUseCase = createProductUseCase;
        this.updateProductUseCase = updateProductUseCase;
        this.deleteProductUseCase = deleteProductUseCase;
        this.getProductsUseCase = getProductsUseCase;
        this.getProductByIdUseCase = getProductByIdUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest request,
                                              Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        ProductDto product = createProductUseCase.execute(request, user.id());
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> update(@PathVariable String id,
                                              @Valid @RequestBody UpdateProductRequest request,
                                              Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        ProductDto product = updateProductUseCase.execute(id, request, user.id(), user.role());
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        deleteProductUseCase.execute(id, user.id(), user.role());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<ProductPageDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(getProductsUseCase.execute(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(getProductByIdUseCase.execute(id));
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductPageDto> getBySeller(@PathVariable String sellerId,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(getProductsUseCase.executeBySeller(sellerId, page, size));
    }

    private UserDto getUserProfile(Authentication authentication) {
        return getUserProfileUseCase.execute(authentication.getName());
    }
}
