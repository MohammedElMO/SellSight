package org.example.sellsight.user.domain.repository;

import org.example.sellsight.user.domain.model.Address;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository {
    Address save(Address address);
    Optional<Address> findById(UUID id);
    List<Address> findByUserId(String userId);
    void deleteById(UUID id);
    void clearDefaultShipping(String userId);
    void clearDefaultBilling(String userId);
}
