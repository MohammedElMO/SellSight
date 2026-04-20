-- V14__normalize_categories.sql
-- Normalizes product category strings to match the canonical frontend list:
-- Electronics | Clothing | Shoes | Sports | Books | Home | Beauty | Toys | Accessories | Other
--
-- Handles Amazon-style naming (All_Electronics, Home_and_Kitchen, etc.)
-- and any other legacy free-text values that don't match the canonical list.

UPDATE products SET category = 'Electronics'
WHERE LOWER(category) LIKE '%electron%';

UPDATE products SET category = 'Beauty'
WHERE LOWER(category) LIKE '%beauty%'
   OR LOWER(category) LIKE '%personal care%'
   OR LOWER(category) LIKE '%health%beauty%';

UPDATE products SET category = 'Clothing'
WHERE LOWER(category) LIKE '%cloth%'
   OR LOWER(category) LIKE '%apparel%'
   OR LOWER(category) LIKE '%fashion%'
   OR LOWER(category) LIKE '%wear%'
   OR (LOWER(category) LIKE '%jewelry%' AND LOWER(category) NOT LIKE '%shoe%');

UPDATE products SET category = 'Shoes'
WHERE LOWER(category) LIKE '%shoe%'
   OR LOWER(category) LIKE '%footwear%'
   OR LOWER(category) LIKE '%boot%'
   OR LOWER(category) LIKE '%sneaker%';

UPDATE products SET category = 'Sports'
WHERE LOWER(category) LIKE '%sport%'
   OR LOWER(category) LIKE '%outdoor%'
   OR LOWER(category) LIKE '%fitness%'
   OR LOWER(category) LIKE '%exercise%';

UPDATE products SET category = 'Books'
WHERE LOWER(category) LIKE '%book%'
   OR LOWER(category) LIKE '%magazine%'
   OR LOWER(category) LIKE '%literature%';

UPDATE products SET category = 'Home'
WHERE LOWER(category) LIKE '%home%'
   OR LOWER(category) LIKE '%kitchen%'
   OR LOWER(category) LIKE '%furniture%'
   OR LOWER(category) LIKE '%garden%'
   OR LOWER(category) LIKE '%appliance%'
   OR LOWER(category) LIKE '%household%';

UPDATE products SET category = 'Toys'
WHERE LOWER(category) LIKE '%toy%'
   OR LOWER(category) LIKE '%game%'
   OR LOWER(category) LIKE '%kids%'
   OR LOWER(category) LIKE '%children%';

UPDATE products SET category = 'Accessories'
WHERE LOWER(category) LIKE '%accessor%'
   OR LOWER(category) LIKE '%watch%'
   OR LOWER(category) LIKE '%bag%'
   OR LOWER(category) LIKE '%wallet%'
   OR LOWER(category) LIKE '%luggage%';

-- Anything not matching a canonical value defaults to 'Other'
UPDATE products SET category = 'Other'
WHERE category NOT IN (
    'Electronics', 'Clothing', 'Shoes', 'Sports',
    'Books', 'Home', 'Beauty', 'Toys', 'Accessories', 'Other'
);
