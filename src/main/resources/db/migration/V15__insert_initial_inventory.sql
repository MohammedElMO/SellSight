-- Insert an initial stock of 1,000,000 for each product into the inventory table
-- Sets a default reorder threshold of 100 for all products
INSERT INTO inventory (product_id, quantity, reorder_threshold)
SELECT id, 1000000, 100
FROM products
ON CONFLICT (product_id) DO UPDATE
SET quantity = 1000000;
