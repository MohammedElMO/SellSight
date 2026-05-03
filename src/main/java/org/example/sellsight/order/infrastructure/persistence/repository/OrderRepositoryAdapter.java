package org.example.sellsight.order.infrastructure.persistence.repository;

import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.order.infrastructure.persistence.mapper.OrderPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class OrderRepositoryAdapter implements OrderRepository {

    private final OrderJpaRepository jpaRepository;
    private final OrderPersistenceMapper mapper;

    public OrderRepositoryAdapter(OrderJpaRepository jpaRepository, OrderPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Order save(Order order) {
        return mapper.toDomain(jpaRepository.save(mapper.toJpa(order)));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue()).map(mapper::toDomain);
    }

    @Override
    public List<Order> findByCustomerId(String customerId) {
        return jpaRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public List<Order> findAll() {
        return jpaRepository.findAllByOrderByCreatedAtDesc().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Order> findBySellerId(String sellerId) {
        return jpaRepository.findByItemSellerId(sellerId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public boolean hasDeliveredOrderWithProduct(String customerId, String productId) {
        return jpaRepository.existsDeliveredOrderWithProduct(customerId, productId);
    }
}
