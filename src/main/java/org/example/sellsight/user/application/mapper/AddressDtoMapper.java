package org.example.sellsight.user.application.mapper;

import org.example.sellsight.user.application.dto.AddressDto;
import org.example.sellsight.user.domain.model.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AddressDtoMapper {

    @Mapping(target = "id", expression = "java(address.getId().toString())")
    AddressDto toDto(Address address);
}
