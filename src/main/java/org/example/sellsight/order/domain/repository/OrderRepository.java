package org.example.sellsight.order.domain.repository;

import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;

import java.util.List;
import java.util.Optional;

/**
 * Port interface for Order persistence.
 */
public interface OrderRepository {

    Order save(Order order);

    Optional<Order> findById(OrderId id);

    List<Order> findByCustomerId(String customerId);

    List<Order> findAll();

    /** Find all orders that contain at least one item belonging to this seller. */
    List<Order> findBySellerId(String sellerId);

    /** Check if a customer has a DELIVERED order containing the given product. */
    boolean hasDeliveredOrderWithProduct(String customerId, String productId);
}
