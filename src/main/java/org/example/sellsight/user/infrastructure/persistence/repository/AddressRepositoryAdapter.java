package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.domain.model.Address;
import org.example.sellsight.user.domain.repository.AddressRepository;
import org.example.sellsight.user.infrastructure.persistence.mapper.AddressPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class AddressRepositoryAdapter implements AddressRepository {

    private final AddressJpaRepository jpa;
    private final AddressPersistenceMapper mapper;

    public AddressRepositoryAdapter(AddressJpaRepository jpa, AddressPersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Address save(Address a) {
        return mapper.toDomain(jpa.save(mapper.toJpa(a)));
    }

    @Override
    public Optional<Address> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Address> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }

    @Override
    public void clearDefaultShipping(String userId) {
        jpa.clearDefaultShipping(userId);
    }

    @Override
    public void clearDefaultBilling(String userId) {
        jpa.clearDefaultBilling(userId);
    }
}
