package org.example.sellsight.order.application.usecase;

import org.example.sellsight.inventory.domain.exception.InsufficientStockException;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.order.application.dto.*;
import org.example.sellsight.order.domain.model.*;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CreateOrderUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateOrderUseCase.class);

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public CreateOrderUseCase(OrderRepository orderRepository,
                               InventoryRepository inventoryRepository,
                               ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderDto execute(CreateOrderRequest request, String customerId) {
        // Validate stock availability before touching the DB
        for (OrderItemRequest itemReq : request.items()) {
            InventoryItem stock = inventoryRepository.findByProductId(itemReq.productId())
                    .orElseThrow(() -> new InsufficientStockException(itemReq.productId(), 0, itemReq.quantity()));
            if (stock.getStockLevel().getQuantity() < itemReq.quantity()) {
                throw new InsufficientStockException(
                        itemReq.productId(), stock.getStockLevel().getQuantity(), itemReq.quantity());
            }
        }

        Order order = new Order(
                OrderId.generate(),
                customerId,
                List.of(),
                OrderStatus.PENDING,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        for (OrderItemRequest itemReq : request.items()) {
            // Resolve sellerId from the product
            String sellerId = productRepository.findById(ProductId.from(itemReq.productId()))
                    .map(Product::getSellerId)
                    .orElse("UNKNOWN");

            order.addItem(new OrderItem(
                    itemReq.productId(),
                    itemReq.productName(),
                    sellerId,
                    itemReq.quantity(),
                    itemReq.unitPrice()
            ));
        }

        Order saved = orderRepository.save(order);
        log.info("Order {} created with status PENDING — awaiting payment confirmation", saved.getId().getValue());
        return toDto(saved);
    }

    static OrderDto toDto(Order o) {
        List<OrderItemDto> itemDtos = o.getItems().stream()
                .map(i -> new OrderItemDto(
                        i.getProductId(), i.getProductName(), i.getSellerId(),
                        i.getQuantity(), i.getUnitPrice(), i.getSubtotal()))
                .toList();

        return new OrderDto(
                o.getId().getValue(), o.getCustomerId(), itemDtos,
                o.getTotal(), o.getStatus().name(),
                o.getCreatedAt(), o.getUpdatedAt()
        );
    }
}
