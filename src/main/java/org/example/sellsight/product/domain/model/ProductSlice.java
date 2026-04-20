package org.example.sellsight.product.domain.model;

import java.util.List;

public record ProductSlice(List<Product> items, boolean hasMore) {}
