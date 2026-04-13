package org.example.sellsight.inventory.infrastructure.web;

import jakarta.validation.Valid;
import org.example.sellsight.inventory.application.dto.StockDto;
import org.example.sellsight.inventory.application.dto.UpdateStockRequest;
import org.example.sellsight.inventory.application.usecase.GetStockUseCase;
import org.example.sellsight.inventory.application.usecase.UpdateStockUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for inventory management.
 */
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

    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<StockDto> getStock(@PathVariable String productId) {
        return ResponseEntity.ok(getStockUseCase.execute(productId));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<StockDto> updateStock(@PathVariable String productId,
                                                  @Valid @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(updateStockUseCase.execute(productId, request));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StockDto>> getLowStock() {
        return ResponseEntity.ok(getStockUseCase.getLowStock());
    }
}
