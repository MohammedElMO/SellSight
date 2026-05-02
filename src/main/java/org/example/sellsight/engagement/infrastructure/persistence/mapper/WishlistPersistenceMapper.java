package org.example.sellsight.engagement.infrastructure.persistence.mapper;

import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;
import org.example.sellsight.engagement.domain.model.WishlistItem;
import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistItemJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.entity.WishlistJpaEntity;
import org.mapstruct.Mapper;

import java.util.ArrayList;

@Mapper(componentModel = "spring")
public interface WishlistPersistenceMapper {

    default WishlistJpaEntity toJpa(Wishlist wishlist) {
        var e = new WishlistJpaEntity();
        e.setId(wishlist.getId().value());
        e.setUserId(wishlist.getUserId());
        e.setName(wishlist.getName());
        e.setDefault(wishlist.isDefault());
        e.setCreatedAt(wishlist.getCreatedAt());

        var items = wishlist.getItems().stream().map(item -> {
            var ie = new WishlistItemJpaEntity();
            ie.setId(item.id());
            ie.setWishlist(e);
            ie.setProductId(item.productId());
            ie.setAddedAt(item.addedAt());
            return ie;
        }).toList();
        e.setItems(new ArrayList<>(items));
        return e;
    }

    default Wishlist toDomain(WishlistJpaEntity e) {
        var items = e.getItems().stream()
                .map(i -> new WishlistItem(i.getId(), i.getProductId(), i.getAddedAt()))
                .toList();
        return new Wishlist(
                WishlistId.of(e.getId()),
                e.getUserId(),
                e.getName(),
                e.isDefault(),
                items,
                e.getCreatedAt()
        );
    }
}
