package org.example.sellsight.product.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.application.dto.BulkCreateResult;
import org.example.sellsight.product.application.dto.BulkCreateResult.BulkRowError;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.embedding.ProductEmbeddingService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkCreateProductsUseCase {

    static final int MAX_ROWS = 100;

    private static final String[] REQUIRED_HEADERS = {"name", "description", "price", "category", "stock"};

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductEmbeddingService embeddingService;

    @Transactional
    @CacheEvict(value = "product-listings", allEntries = true)
    public BulkCreateResult execute(MultipartFile file, String sellerId) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty.");
        }

        List<BulkRowError> errors = new ArrayList<>();
        int created = 0;
        int rowNumber = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV file has no header row.");
            }

            String[] headers = parseCsvLine(headerLine);
            validateHeaders(headers);

            int nameIdx        = indexOf(headers, "name");
            int descIdx        = indexOf(headers, "description");
            int priceIdx       = indexOf(headers, "price");
            int categoryIdx    = indexOf(headers, "category");
            int stockIdx       = indexOf(headers, "stock");
            int imageIdx       = indexOf(headers, "imageurl");

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                rowNumber++;

                if (rowNumber > MAX_ROWS) {
                    errors.add(new BulkRowError(rowNumber, "Maximum of " + MAX_ROWS + " products per upload exceeded. Remaining rows ignored."));
                    break;
                }

                try {
                    String[] cols = parseCsvLine(line);

                    String name     = getCol(cols, nameIdx);
                    String desc     = getCol(cols, descIdx);
                    String priceStr = getCol(cols, priceIdx);
                    String category = getCol(cols, categoryIdx);
                    String stockStr = getCol(cols, stockIdx);
                    String imageUrl = imageIdx >= 0 ? getCol(cols, imageIdx) : null;

                    if (name.isBlank())     throw new IllegalArgumentException("Name is required.");
                    if (category.isBlank()) throw new IllegalArgumentException("Category is required.");
                    if (priceStr.isBlank()) throw new IllegalArgumentException("Price is required.");

                    BigDecimal price;
                    try {
                        price = new BigDecimal(priceStr.trim());
                        if (price.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Price must be > 0.");
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Invalid price value: '" + priceStr + "'.");
                    }

                    int stock = 0;
                    if (!stockStr.isBlank()) {
                        try {
                            stock = Integer.parseInt(stockStr.trim());
                            if (stock < 0) throw new IllegalArgumentException("Stock cannot be negative.");
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid stock value: '" + stockStr + "'.");
                        }
                    }

                    Product product = new Product(
                            ProductId.generate(),
                            name.trim(),
                            desc,
                            new Money(price),
                            category.trim(),
                            sellerId,
                            (imageUrl != null && !imageUrl.isBlank()) ? imageUrl.trim() : null,
                            true,
                            LocalDateTime.now(),
                            LocalDateTime.now()
                    );
                    Product saved = productRepository.save(product);
                    inventoryRepository.save(new InventoryItem(saved.getId().getValue(), StockLevel.of(stock), 5));

                    final String savedId = saved.getId().getValue();
                    final String savedName = saved.getName();
                    final String savedDescription = saved.getDescription();
                    final String savedCategory = saved.getCategory();
                    embeddingService.updateEmbeddingAsync(savedId, savedName, savedDescription, savedCategory);

                    created++;
                } catch (Exception e) {
                    errors.add(new BulkRowError(rowNumber + 1, e.getMessage()));
                }
            }
        }

        log.info("Bulk product upload: seller={} created={} failed={}", sellerId, created, errors.size());
        return new BulkCreateResult(created, errors.size(), errors);
    }

    private void validateHeaders(String[] headers) {
        List<String> normalized = List.of(headers).stream()
                .map(h -> h.toLowerCase().trim())
                .toList();
        for (String required : REQUIRED_HEADERS) {
            if (!normalized.contains(required)) {
                throw new IllegalArgumentException("Missing required CSV column: '" + required + "'.");
            }
        }
    }

    private int indexOf(String[] headers, String name) {
        for (int i = 0; i < headers.length; i++) {
            if (headers[i].toLowerCase().trim().equals(name)) return i;
        }
        return -1;
    }

    private String getCol(String[] cols, int idx) {
        if (idx < 0 || idx >= cols.length) return "";
        return cols[idx] == null ? "" : cols[idx].trim();
    }

    /**
     * Simple RFC-4180-style CSV line parser. Handles quoted fields (with commas and escaped quotes).
     */
    static String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());
        return result.toArray(new String[0]);
    }
}
