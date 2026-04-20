package org.example.sellsight.engagement.domain.repository;

import org.example.sellsight.engagement.domain.model.Wishlist;
import org.example.sellsight.engagement.domain.model.WishlistId;

import java.util.List;
import java.util.Optional;

/** Outbound port for wishlist persistence. */
public interface WishlistRepository {
    Wishlist save(Wishlist wishlist);
    Optional<Wishlist> findById(WishlistId id);
    List<Wishlist> findByUserId(String userId);
    void deleteById(WishlistId id);
}
