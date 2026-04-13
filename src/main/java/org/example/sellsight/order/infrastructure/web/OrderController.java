package org.example.sellsight.order.infrastructure.web;

import jakarta.validation.Valid;
import org.example.sellsight.order.application.dto.CreateOrderRequest;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.usecase.*;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for order operations.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderUseCase getOrderUseCase;
    private final GetUserOrdersUseCase getUserOrdersUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public OrderController(CreateOrderUseCase createOrderUseCase,
                            GetOrderUseCase getOrderUseCase,
                            GetUserOrdersUseCase getUserOrdersUseCase,
                            UpdateOrderStatusUseCase updateOrderStatusUseCase,
                            GetUserProfileUseCase getUserProfileUseCase) {
        this.createOrderUseCase = createOrderUseCase;
        this.getOrderUseCase = getOrderUseCase;
        this.getUserOrdersUseCase = getUserOrdersUseCase;
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest request,
                                            Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        return ResponseEntity.ok(createOrderUseCase.execute(request, user.id()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(getOrderUseCase.execute(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        return ResponseEntity.ok(getUserOrdersUseCase.execute(user.id()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAll() {
        return ResponseEntity.ok(getUserOrdersUseCase.executeAll());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable String id,
                                                   @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(updateOrderStatusUseCase.execute(id, status));
    }

    private UserDto getUserProfile(Authentication authentication) {
        return getUserProfileUseCase.execute(authentication.getName());
    }
}
