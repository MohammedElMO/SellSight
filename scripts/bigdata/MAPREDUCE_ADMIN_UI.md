# MapReduce Integration with Admin UI - Complete Guide

## 📋 Summary

You now have 3 MapReduce jobs integrated in the Big Data pipeline:

| Job | Input | Output | Use Case |
|-----|-------|--------|----------|
| **Product Popularity** | Events → products | Gold popularity scores | Seller dashboard, trending products |
| **User Features** | User events → distinct products | User engagement metrics | Consumer profile, recommendations |
| **Category Trends** | Category events → trends | Category KPIs + top products | Category dashboards, trending sections |

---

## 🎯 Admin Seller Use Case: Top Products Widget

### 1. Backend API Endpoint

**File**: `src/main/java/org/sellsight/api/controller/SellerAnalyticsController.java`

```java
@RestController
@RequestMapping("/api/v1/sellers/{sellerId}/analytics")
public class SellerAnalyticsController {
  
  @Autowired
  private SellerAnalyticsService sellerAnalyticsService;
  
  @GetMapping("/top-products")
  public ResponseEntity<List<TopProductDTO>> getTopProducts(
    @PathVariable Long sellerId,
    @RequestParam(defaultValue = "10") int limit
  ) {
    // Query from gold_product_popularity
    List<TopProductDTO> topProducts = sellerAnalyticsService
      .getTopProductsByPopularity(sellerId, limit);
    return ResponseEntity.ok(topProducts);
  }
}
```

### 2. Service Layer

```java
@Service
public class SellerAnalyticsService {
  
  @Autowired
  private ProductRepository productRepository;
  
  public List<TopProductDTO> getTopProductsByPopularity(Long sellerId, int limit) {
    // SQL Query:
    // SELECT p.id, p.name, pp.views, pp.add_to_cart, pp.avg_rating, pp.popularity_score
    // FROM products p
    // JOIN gold_product_popularity pp ON p.id = pp.product_id
    // WHERE p.seller_id = ?
    // ORDER BY pp.popularity_score DESC
    // LIMIT ?
    
    return productRepository.findTopProductsByPopularity(sellerId, limit);
  }
}
```

### 3. Frontend Component

**File**: `sellsight-front/src/app/seller/dashboard/top-products.tsx`

```tsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopProduct {
  id: number;
  name: string;
  views: number;
  addToCart: number;
  avgRating: number;
  popularityScore: number;
}

export default function TopProductsWidget() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('/api/v1/sellers/me/analytics/top-products?limit=10');
        const data = await response.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Top Products by Popularity Score</h2>
      
      {/* Score visualization */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={products}>
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="popularityScore" fill="#3b82f6" name="Score" />
          <Bar dataKey="views" fill="#10b981" name="Views" />
          <Bar dataKey="addToCart" fill="#f59e0b" name="Cart Adds" />
        </BarChart>
      </ResponsiveContainer>

      {/* Detailed table */}
      <table className="w-full mt-6">
        <thead>
          <tr>
            <th>Product</th>
            <th>Score</th>
            <th>Views</th>
            <th>Cart</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td className="font-bold text-lg">{product.popularityScore.toFixed(2)}</td>
              <td>{product.views}</td>
              <td>{product.addToCart}</td>
              <td>⭐ {product.avgRating.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🎯 Admin Consumer Use Case: Category Trends

### 1. Backend API Endpoint

**File**: `src/main/java/org/sellsight/api/controller/AdminDashboardController.java`

```java
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {
  
  @Autowired
  private CategoryTrendsService categoryTrendsService;
  
  @GetMapping("/category-trends")
  public ResponseEntity<List<CategoryTrendDTO>> getCategoryTrends() {
    // Query all categories from gold_category_trends
    List<CategoryTrendDTO> trends = categoryTrendsService.getAllCategoryTrends();
    return ResponseEntity.ok(trends);
  }
}
```

### 2. Service Layer

```java
@Service
public class CategoryTrendsService {
  
  @Autowired
  private CategoryRepository categoryRepository;
  
  public List<CategoryTrendDTO> getAllCategoryTrends() {
    // SELECT category, total_views, total_carts, top_products, avg_rating, trend_score
    // FROM gold_category_trends
    // ORDER BY trend_score DESC
    
    return categoryRepository.findAllCategoryTrends();
  }
  
  public List<Long> parseTopProductIds(String topProductsStr) {
    // Parse: "prod_A(5000),prod_B(4800)" → [prod_A, prod_B]
    return Arrays.stream(topProductsStr.split(","))
      .map(item -> Long.parseLong(item.replaceAll("[^0-9]", "")))
      .collect(Collectors.toList());
  }
}
```

### 3. Frontend Component

**File**: `sellsight-front/src/app/admin/dashboard/category-trends.tsx`

```tsx
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface CategoryTrend {
  category: string;
  totalViews: number;
  totalCarts: number;
  topProducts: string; // "prod_A(5000),prod_B(4800)"
  avgRating: number;
  trendScore: number;
}

export default function CategoryTrendsWidget() {
  const [trends, setTrends] = useState<CategoryTrend[]>([]);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard/category-trends')
      .then(r => r.json())
      .then(setTrends);
  }, []);

  const parseTopProducts = (topProductsStr: string) => {
    return topProductsStr.split(',').map(item => {
      const match = item.match(/prod_(\w+)\((\d+)\)/);
      return {
        id: match?.[1],
        views: parseInt(match?.[2] || '0'),
      };
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Category Trends</h2>
      
      {trends.map((trend) => (
        <div key={trend.category} className="card p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{trend.category}</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              <span className="text-xl font-bold">{trend.trendScore.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-600">Views</p>
              <p className="text-lg font-bold">{trend.totalViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Cart Adds</p>
              <p className="text-lg font-bold">{trend.totalCarts.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Rating</p>
              <p className="text-lg font-bold">⭐ {trend.avgRating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-600">Conversion</p>
              <p className="text-lg font-bold">
                {((trend.totalCarts / trend.totalViews) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-xs text-gray-600 mb-1">Top Products in this Category</p>
            <div className="flex gap-2">
              {parseTopProducts(trend.topProducts).map((product, idx) => (
                <span 
                  key={idx} 
                  className="badge bg-blue-100 text-blue-800"
                >
                  {product.id} ({product.views.toLocaleString()} views)
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Consumer Use Case: User Insights Profile

### 1. Backend API Endpoint

**File**: `src/main/java/org/sellsight/api/controller/UserInsightsController.java`

```java
@RestController
@RequestMapping("/api/v1/users/me/insights")
@PreAuthorize("isAuthenticated()")
public class UserInsightsController {
  
  @Autowired
  private UserInsightsService userInsightsService;
  
  @GetMapping
  public ResponseEntity<UserInsightsDTO> getUserInsights(
    @AuthenticationPrincipal User currentUser
  ) {
    // Query from gold_user_features WHERE user_id = currentUser.id
    UserInsightsDTO insights = userInsightsService.getUserInsights(currentUser.getId());
    return ResponseEntity.ok(insights);
  }
}
```

### 2. Frontend Component

**File**: `sellsight-front/src/app/(account)/profile/insights.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Zap, ShoppingCart, Package, Star } from 'lucide-react';

interface UserInsights {
  productsViewed: number;
  productsCarted: number;
  productsPurchased: number;
  conversionRate: number;
  avgRatingGiven: number;
  preferredCategory: string;
}

export default function UserInsightsPage() {
  const [insights, setInsights] = useState<UserInsights | null>(null);

  useEffect(() => {
    fetch('/api/v1/users/me/insights')
      .then(r => r.json())
      .then(setInsights);
  }, []);

  if (!insights) return <div>Loading...</div>;

  const conversionRate = (
    (insights.productsPurchased / insights.productsCarted) * 100
  ).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Insights</h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Viewed */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-blue-500" size={20} />
            <span className="text-gray-600 text-sm">Viewed</span>
          </div>
          <p className="text-3xl font-bold">{insights.productsViewed}</p>
        </div>

        {/* Carted */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="text-orange-500" size={20} />
            <span className="text-gray-600 text-sm">Carted</span>
          </div>
          <p className="text-3xl font-bold">{insights.productsCarted}</p>
        </div>

        {/* Purchased */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-green-500" size={20} />
            <span className="text-gray-600 text-sm">Purchased</span>
          </div>
          <p className="text-3xl font-bold">{insights.productsPurchased}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-purple-500" size={20} />
            <span className="text-gray-600 text-sm">Conversion</span>
          </div>
          <p className="text-3xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 text-sm">Your Favorite Category</label>
            <p className="text-2xl font-bold">{insights.preferredCategory}</p>
            <button className="mt-2 text-blue-600 hover:underline">
              Explore {insights.preferredCategory} →
            </button>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Average Rating Given</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{insights.avgRatingGiven.toFixed(1)}</p>
              <div className="text-xl">
                {'⭐'.repeat(Math.round(insights.avgRatingGiven))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Shopping Pattern</label>
            <p className="text-sm mt-2 text-gray-700">
              {insights.conversionRate > 30
                ? '✨ You have a high conversion rate - an engaged shopper!'
                : 'You tend to browse a lot. Check your cart for forgotten items!'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Personalized for You</h2>
        <p className="mb-4">
          Based on your {insights.productsViewed} product views and {insights.productsPurchased} purchases
        </p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100">
          Explore Recommendations
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 Complete Workflow

```bash
# 1. Start everything
docker-compose up -d

# 2. Initialize Hadoop
bash scripts/bigdata/init-hadoop.sh

# 3. Run complete pipeline (includes MapReduce)
bash scripts/bigdata/run-pipeline.sh all

# 4. Verify outputs
docker exec hadoopnamenode hdfs dfs -ls -R /data/gold/

# 5. Query from PostgreSQL (gold tables should exist)
docker exec postgres psql -U sellsight -d sellsight_db \
  -c "SELECT * FROM gold_product_popularity LIMIT 5;"

# 6. Backend APIs will pick up the new tables automatically
# 7. Frontend will display analytics, trends, and user insights
```

---

## 📚 Key Files

| Location | Purpose |
|----------|---------|
| `scripts/bigdata/mapreduce/*.py` | MapReduce mapper/reducer scripts |
| `scripts/bigdata/run-mapreduce.sh` | Run all 3 MapReduce jobs |
| `scripts/bigdata/run-pipeline.sh` | Complete pipeline orchestration |
| `scripts/bigdata/MAPREDUCE.md` | Detailed MapReduce documentation |
| `scripts/bigdata/ARCHITECTURE.md` | Overall architecture guide |

