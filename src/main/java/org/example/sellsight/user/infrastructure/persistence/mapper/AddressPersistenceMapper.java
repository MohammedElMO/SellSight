package org.example.sellsight.user.infrastructure.persistence.mapper;

import org.example.sellsight.user.domain.model.Address;
import org.example.sellsight.user.infrastructure.persistence.entity.AddressJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressPersistenceMapper {

    AddressJpaEntity toJpa(Address address);

    default Address toDomain(AddressJpaEntity e) {
        return new Address(
                e.getId(), e.getUserId(), e.getLabel(),
                e.getFirstName(), e.getLastName(), e.getStreet(),
                e.getCity(), e.getState(), e.getZip(), e.getCountry(),
                e.getPhone(), e.isDefaultShipping(), e.isDefaultBilling(),
                e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
