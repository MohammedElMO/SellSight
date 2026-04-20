package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.application.dto.AddressDto;
import org.example.sellsight.user.domain.model.Address;
import org.example.sellsight.user.domain.repository.AddressRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Address CRUD operations.
 */
@Component
public class ManageAddressUseCase {

    private final AddressRepository addressRepository;

    public ManageAddressUseCase(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDto> getAll(String userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toDto).toList();
    }

    public AddressDto create(String userId, AddressDto dto) {
        Address address = new Address(
                UUID.randomUUID(), userId, dto.label(),
                dto.firstName(), dto.lastName(), dto.street(),
                dto.city(), dto.state(), dto.zip(), dto.country(),
                dto.phone(), dto.isDefaultShipping(), dto.isDefaultBilling(),
                LocalDateTime.now(), null
        );

        if (dto.isDefaultShipping()) {
            addressRepository.clearDefaultShipping(userId);
        }
        if (dto.isDefaultBilling()) {
            addressRepository.clearDefaultBilling(userId);
        }

        return toDto(addressRepository.save(address));
    }

    public AddressDto update(String userId, String addressId, AddressDto dto) {
        Address address = addressRepository.findById(UUID.fromString(addressId))
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied");
        }

        address.update(dto.label(), dto.firstName(), dto.lastName(),
                dto.street(), dto.city(), dto.state(), dto.zip(),
                dto.country(), dto.phone());

        if (dto.isDefaultShipping()) {
            addressRepository.clearDefaultShipping(userId);
            address.setAsDefaultShipping();
        }
        if (dto.isDefaultBilling()) {
            addressRepository.clearDefaultBilling(userId);
            address.setAsDefaultBilling();
        }

        return toDto(addressRepository.save(address));
    }

    public void delete(String userId, String addressId) {
        Address address = addressRepository.findById(UUID.fromString(addressId))
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalStateException("Access denied");
        }
        addressRepository.deleteById(UUID.fromString(addressId));
    }

    private AddressDto toDto(Address a) {
        return new AddressDto(
                a.getId().toString(), a.getFirstName(), a.getLastName(),
                a.getLabel(), a.getStreet(), a.getCity(), a.getState(),
                a.getZip(), a.getCountry(), a.getPhone(),
                a.isDefaultShipping(), a.isDefaultBilling()
        );
    }
}
