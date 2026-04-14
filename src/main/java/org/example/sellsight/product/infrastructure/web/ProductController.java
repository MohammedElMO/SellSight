package org.example.sellsight.product.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.product.application.dto.*;
import org.example.sellsight.product.application.usecase.*;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for product CRUD operations.
 */
@Tag(name = "Products", description = "Browse, create, update, and delete product listings")
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

    // ── Public read endpoints ────────────────────────────────

    @Operation(
        operationId = "getProducts",
        summary     = "List all products",
        description = "Returns a paginated list of all active products. No authentication required."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Paginated product list",
            content = @Content(schema = @Schema(implementation = ProductPageDto.class)))
    })
    @GetMapping
    public ResponseEntity<ProductPageDto> getAll(
            @Parameter(description = "Zero-based page index", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(getProductsUseCase.execute(page, size));
    }

    @Operation(
        operationId = "getProductById",
        summary     = "Get product by ID",
        description = "Returns a single product. No authentication required."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product found",
            content = @Content(schema = @Schema(implementation = ProductDto.class))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable String id) {
        return ResponseEntity.ok(getProductByIdUseCase.execute(id));
    }

    // ── Seller / Admin endpoints ─────────────────────────────

    @Operation(
        operationId = "getProductsBySeller",
        summary     = "Get products by seller",
        description = "Returns a paginated list of products owned by the specified seller. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Paginated product list",
            content = @Content(schema = @Schema(implementation = ProductPageDto.class))),
        @ApiResponse(responseCode = "401", description = "Not authenticated",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductPageDto> getBySeller(
            @Parameter(description = "Seller UUID", required = true)
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(getProductsUseCase.executeBySeller(sellerId, page, size));
    }

    @Operation(
        operationId = "createProduct",
        summary     = "Create a product",
        description = "Creates a new product listing owned by the authenticated seller. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product created",
            content = @Content(schema = @Schema(implementation = ProductDto.class))),
        @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> create(
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        ProductDto product = createProductUseCase.execute(request, user.id());
        return ResponseEntity.ok(product);
    }

    @Operation(
        operationId = "updateProduct",
        summary     = "Update a product",
        description = "Updates an existing product. The seller must own the product, or the caller must be ADMIN. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product updated",
            content = @Content(schema = @Schema(implementation = ProductDto.class))),
        @ApiResponse(responseCode = "403", description = "Not the owner or insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> update(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable String id,
            @Valid @RequestBody UpdateProductRequest request,
            Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        ProductDto product = updateProductUseCase.execute(id, request, user.id(), user.role());
        return ResponseEntity.ok(product);
    }

    @Operation(
        operationId = "deleteProduct",
        summary     = "Delete (deactivate) a product",
        description = "Soft-deletes a product by marking it inactive. "
                    + "The seller must own the product, or the caller must be ADMIN.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Product deactivated"),
        @ApiResponse(responseCode = "403", description = "Not the owner or insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable String id,
            Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        deleteProductUseCase.execute(id, user.id(), user.role());
        return ResponseEntity.noContent().build();
    }

    private UserDto getUserProfile(Authentication authentication) {
        return getUserProfileUseCase.execute(authentication.getName());
    }
}
