package org.example.sellsight.inventory.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.inventory.application.dto.StockDto;
import org.example.sellsight.inventory.application.dto.UpdateStockRequest;
import org.example.sellsight.inventory.application.usecase.GetStockUseCase;
import org.example.sellsight.inventory.application.usecase.UpdateStockUseCase;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for inventory management.
 * All endpoints require SELLER or ADMIN role.
 */
@Tag(name = "Inventory", description = "Manage stock levels and monitor low-stock thresholds")
@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final GetStockUseCase getStockUseCase;
    private final UpdateStockUseCase updateStockUseCase;

    public InventoryController(GetStockUseCase getStockUseCase,
                                UpdateStockUseCase updateStockUseCase) {
        this.getStockUseCase = getStockUseCase;
        this.updateStockUseCase = updateStockUseCase;
    }

    @Operation(
        operationId = "getStock",
        summary     = "Get stock level for a product",
        description = "Returns the current quantity and reorder threshold. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Stock level returned",
            content = @Content(schema = @Schema(implementation = StockDto.class))),
        @ApiResponse(responseCode = "404", description = "No inventory record found for product",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<StockDto> getStock(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable String productId) {
        return ResponseEntity.ok(getStockUseCase.execute(productId));
    }

    @Operation(
        operationId = "updateStock",
        summary     = "Update stock level",
        description = "Sets the quantity (and optionally the reorder threshold) for a product. "
                    + "Creates the inventory record if it does not exist. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Stock updated",
            content = @Content(schema = @Schema(implementation = StockDto.class))),
        @ApiResponse(responseCode = "400", description = "Validation error (e.g. negative quantity)",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Insufficient role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<StockDto> updateStock(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable String productId,
            @Valid @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(updateStockUseCase.execute(productId, request));
    }

    @Operation(
        operationId = "getLowStock",
        summary     = "List low-stock products",
        description = "Returns all inventory items where quantity is at or below the reorder threshold. "
                    + "Requires ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Low-stock items listed",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = StockDto.class)))),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StockDto>> getLowStock() {
        return ResponseEntity.ok(getStockUseCase.getLowStock());
    }
}
