package org.example.sellsight.user.infrastructure.persistence.repository;

import org.example.sellsight.user.domain.model.Address;
import org.example.sellsight.user.domain.repository.AddressRepository;
import org.example.sellsight.user.infrastructure.persistence.entity.AddressJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class AddressRepositoryAdapter implements AddressRepository {

    private final AddressJpaRepository jpa;

    public AddressRepositoryAdapter(AddressJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Address save(Address a) {
        return toDomain(jpa.save(toJpa(a)));
    }

    @Override
    public Optional<Address> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<Address> findByUserId(String userId) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain).toList();
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

    private AddressJpaEntity toJpa(Address a) {
        var e = new AddressJpaEntity();
        e.setId(a.getId());
        e.setUserId(a.getUserId());
        e.setLabel(a.getLabel());
        e.setFirstName(a.getFirstName());
        e.setLastName(a.getLastName());
        e.setStreet(a.getStreet());
        e.setCity(a.getCity());
        e.setState(a.getState());
        e.setZip(a.getZip());
        e.setCountry(a.getCountry());
        e.setPhone(a.getPhone());
        e.setDefaultShipping(a.isDefaultShipping());
        e.setDefaultBilling(a.isDefaultBilling());
        e.setCreatedAt(a.getCreatedAt());
        e.setUpdatedAt(a.getUpdatedAt());
        return e;
    }

    private Address toDomain(AddressJpaEntity e) {
        return new Address(
                e.getId(), e.getUserId(), e.getLabel(),
                e.getFirstName(), e.getLastName(), e.getStreet(),
                e.getCity(), e.getState(), e.getZip(), e.getCountry(),
                e.getPhone(), e.isDefaultShipping(), e.isDefaultBilling(),
                e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
