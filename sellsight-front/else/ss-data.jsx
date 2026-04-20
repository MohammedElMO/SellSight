// ── Mock Data ──────────────────────────────────────────────────

const SS_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books'];

const SS_PRODUCTS = [
  { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 179, rating: 4.5, reviews: 234, seller: 'TechVault', aiPick: true, featured: true },
  { id: 'p2', name: 'Merino Wool Crewneck Sweater', category: 'Fashion', price: 89, rating: 4.2, reviews: 89, seller: 'NordStitch', aiPick: false, featured: false },
  { id: 'p3', name: 'Smart Home Hub Pro', category: 'Electronics', price: 129, rating: 4.7, reviews: 567, seller: 'SmartLiving', aiPick: true, featured: true },
  { id: 'p4', name: 'Running Shoes Ultra Boost', category: 'Sports', price: 159, rating: 4.3, reviews: 312, seller: 'PeakGear', aiPick: false, featured: false },
  { id: 'p5', name: 'Ceramic Pour-Over Coffee Set', category: 'Home', price: 45, rating: 4.8, reviews: 45, seller: 'BrewCraft', aiPick: true, featured: false },
  { id: 'p6', name: 'Organic Vitamin C Face Serum', category: 'Beauty', price: 38, rating: 4.1, reviews: 156, seller: 'GlowLab', aiPick: false, featured: false },
  { id: 'p7', name: 'Mechanical Keyboard 75%', category: 'Electronics', price: 149, rating: 4.6, reviews: 423, seller: 'TechVault', aiPick: true, featured: true },
  { id: 'p8', name: 'Linen Blend Summer Shirt', category: 'Fashion', price: 65, rating: 4.0, reviews: 67, seller: 'NordStitch', aiPick: false, featured: false },
  { id: 'p9', name: 'HEPA Air Purifier XL', category: 'Home', price: 199, rating: 4.4, reviews: 189, seller: 'SmartLiving', aiPick: false, featured: false },
  { id: 'p10', name: 'Trail Running Hydration Pack', category: 'Sports', price: 79, rating: 4.5, reviews: 234, seller: 'PeakGear', aiPick: false, featured: false },
  { id: 'p11', name: 'Cast Iron Dutch Oven 6Qt', category: 'Home', price: 85, rating: 4.9, reviews: 34, seller: 'BrewCraft', aiPick: true, featured: false },
  { id: 'p12', name: 'Retinol Night Recovery Cream', category: 'Beauty', price: 42, rating: 4.3, reviews: 278, seller: 'GlowLab', aiPick: false, featured: false },
  { id: 'p13', name: 'USB-C Thunderbolt Docking Station', category: 'Electronics', price: 119, rating: 4.2, reviews: 145, seller: 'TechVault', aiPick: false, featured: false },
  { id: 'p14', name: 'Cashmere Ribbed Beanie', category: 'Fashion', price: 55, rating: 4.6, reviews: 98, seller: 'NordStitch', aiPick: false, featured: false },
  { id: 'p15', name: 'Robot Vacuum with Mapping', category: 'Home', price: 399, rating: 4.7, reviews: 876, seller: 'SmartLiving', aiPick: true, featured: true },
  { id: 'p16', name: 'Premium Cork Yoga Mat', category: 'Sports', price: 35, rating: 4.4, reviews: 203, seller: 'PeakGear', aiPick: false, featured: false },
  { id: 'p17', name: 'Borosilicate French Press 34oz', category: 'Home', price: 29, rating: 4.8, reviews: 56, seller: 'BrewCraft', aiPick: false, featured: false },
  { id: 'p18', name: 'Hyaluronic Acid Hair Oil', category: 'Beauty', price: 48, rating: 4.1, reviews: 167, seller: 'GlowLab', aiPick: false, featured: false },
  { id: 'p19', name: '4K HDR Streaming Webcam', category: 'Electronics', price: 99, rating: 4.5, reviews: 345, seller: 'TechVault', aiPick: false, featured: false },
  { id: 'p20', name: 'Recycled Down Puffer Jacket', category: 'Fashion', price: 245, rating: 4.3, reviews: 78, seller: 'NordStitch', aiPick: false, featured: false },
];

Object.assign(window, { SS_CATEGORIES, SS_PRODUCTS });
