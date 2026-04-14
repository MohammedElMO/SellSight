package org.example.sellsight.order.infrastructure.web;

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
import org.example.sellsight.order.application.dto.CreateOrderRequest;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.usecase.*;
import org.example.sellsight.shared.exception.ErrorResponse;
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
 *
 * <p>State machine: PENDING → CONFIRMED → SHIPPED → DELIVERED (or CANCELLED from any non-final state).
 */
@Tag(name = "Orders", description = "Place orders, track status, and manage the order lifecycle")
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

    @Operation(
        operationId = "createOrder",
        summary     = "Create an order",
        description = "Places a new order for the authenticated customer. "
                    + "The order is automatically confirmed after creation. "
                    + "Requires CUSTOMER role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order placed and confirmed",
            content = @Content(schema = @Schema(implementation = OrderDto.class))),
        @ApiResponse(responseCode = "400", description = "Validation error — empty items, negative quantity, etc.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Only CUSTOMER role can place orders",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> create(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        return ResponseEntity.ok(createOrderUseCase.execute(request, user.id()));
    }

    @Operation(
        operationId = "getOrderById",
        summary     = "Get order by ID",
        description = "Returns the full order details, including all line items and current status.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order found",
            content = @Content(schema = @Schema(implementation = OrderDto.class))),
        @ApiResponse(responseCode = "404", description = "Order not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getById(
            @Parameter(description = "Order UUID", required = true)
            @PathVariable String id) {
        return ResponseEntity.ok(getOrderUseCase.execute(id));
    }

    @Operation(
        operationId = "getMyOrders",
        summary     = "Get my orders",
        description = "Returns all orders placed by the currently authenticated customer.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of orders",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = OrderDto.class)))),
        @ApiResponse(responseCode = "401", description = "Not authenticated",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/my")
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        UserDto user = getUserProfile(authentication);
        return ResponseEntity.ok(getUserOrdersUseCase.execute(user.id()));
    }

    @Operation(
        operationId = "getAllOrders",
        summary     = "Get all orders (admin)",
        description = "Returns every order in the system. Requires ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Full order list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = OrderDto.class)))),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAll() {
        return ResponseEntity.ok(getUserOrdersUseCase.executeAll());
    }

    @Operation(
        operationId = "updateOrderStatus",
        summary     = "Update order status",
        description = "Advances the order state machine. "
                    + "Valid transitions: PENDING→CONFIRMED, CONFIRMED→SHIPPED, SHIPPED→DELIVERED, "
                    + "PENDING/CONFIRMED/SHIPPED→CANCELLED. "
                    + "Requires SELLER or ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated",
            content = @Content(schema = @Schema(implementation = OrderDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid state transition",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Order not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<OrderDto> updateStatus(
            @Parameter(description = "Order UUID", required = true)
            @PathVariable String id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "New status, e.g. `{\"status\": \"SHIPPED\"}`",
                required = true
            )
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(updateOrderStatusUseCase.execute(id, status));
    }

    private UserDto getUserProfile(Authentication authentication) {
        return getUserProfileUseCase.execute(authentication.getName());
    }
}
