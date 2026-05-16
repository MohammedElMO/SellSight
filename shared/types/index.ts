// ============================================================
// SellSight — Shared TypeScript Types
// Generated from backend Java DTOs
// ============================================================

// ── Auth ────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'SELLER' | 'CUSTOMER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type OAuthProvider = 'GOOGLE' | 'SLACK';

export interface OAuthLoginRequest {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
}

export interface AuthResponse {
  // token is null for browser cookie-based auth flows; non-null only for legacy API/Swagger endpoints
  token: string | null;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  sellerStatus: string | null;
}

export interface TotpChallengeResponse {
  requires2fa: true;
  challengeToken: string;
  firstName: string;
}

export interface Admin2faSetupRequiredResponse {
  requires2faSetup: true;
  setupToken: string;
  firstName: string;
}

export interface Setup2faCompleteResponse {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  sellerStatus: string | null;
  backupCodes: string[];
}

export interface AdminManagementDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  disabled: boolean;
  deleted: boolean;
  totpEnabled: boolean;
  setupRequired: boolean;
  setupApproved: boolean;
  resetRequired: boolean;
  failed2faAttempts: number;
  last2faVerifiedAt: string | null;
  createdAt: string;
  activeSessionCount: number;
}

export interface Verify2faRequest {
  challengeToken: string;
  code: string;
}

export interface TotpSetupResponse {
  requiresPasswordChange: boolean;
  qrCode: string | null;   // null when requiresPasswordChange=true or secret already generated
  secret: string | null;   // null in the same cases above
}

export interface BootstrapChangePasswordRequest {
  setupToken: string;
  newPassword: string;
}

export interface CreateAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  tempPassword: string;
}

export interface Enable2faResponse {
  backupCodes: string[];
}

export interface TotpStatusResponse {
  enabled: boolean;
}

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SessionDto {
  id: string;
  userId: string;
  userEmail?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  revokedAt?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  tokenFamilyId?: string;
}

export interface SellerApplicationDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sellerStatus: SellerStatus;
  createdAt: string;
}

// ── User ────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string; // ISO 8601
  avatarUrl?: string | null;
}

export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  sellerStatus?: string | null;
  authProvider: string;
  disabled: boolean;
  deleted: boolean;
  deletedAt?: string | null;
  activeSessionCount: number;
}

export interface AdminUserPageDto {
  users: AdminUserDto[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ChangeRoleRequest {
  role: Role;
}

export interface LandingDto {
  popular: ProductDto[];
  newArrivals: ProductDto[];
  trending: ProductDto[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

// ── Address ─────────────────────────────────────────────────

export interface AddressDto {
  id?: string;
  firstName: string;
  lastName: string;
  label: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

// ── Product ─────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  initialStock?: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sellerId: string;
  imageUrl: string | null;
  brand: string | null;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  stockQuantity: number;
}

export interface AutocompleteDto {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  price: number;
}

export type SearchMode = 'HYBRID' | 'FULL_TEXT' | 'BROWSE' | 'NONE';

export interface ProductPageDto {
  products: ProductDto[];
  page: number;
  size: number;
  hasMore: boolean;
  totalPages: number;
  totalElements: number;
  searchMode?: SearchMode;
}

// ── Order ───────────────────────────────────────────────────

export interface OrderItemRequest {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface CreatePaymentIntentRequest {
  amount: number;
  orderId: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderDto {
  id: string;
  customerId: string;
  items: OrderItemDto[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string | null;
}

// ── Inventory ───────────────────────────────────────────────

export interface StockDto {
  productId: string;
  quantity: number;
  reorderThreshold: number;
  lowStock: boolean;
}

export interface UpdateStockRequest {
  quantity: number;
  reorderThreshold?: number;
}

export interface BatchUpdateStockItem {
  productId: string;
  quantity: number;
}

export interface BatchUpdateStockRequest {
  items: BatchUpdateStockItem[];
}

// ── Reviews ─────────────────────────────────────────────────

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  body?: string;
  imageUrls?: string[];
}

export interface ReviewDto {
  id: string;
  productId: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  rating: number;
  title: string;
  body: string | null;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string | null;
  imageUrls: string[];
}

// ── Wishlists ───────────────────────────────────────────────

export interface WishlistItemDto {
  id: number;
  productId: string;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  addedAt: string;
}

export interface WishlistDto {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  items: WishlistItemDto[];
  createdAt: string;
}

// ── Q&A ─────────────────────────────────────────────────────

export interface AnswerDto {
  id: string;
  answererId: string;
  answererName: string;
  body: string;
  createdAt: string;
}

export interface QuestionDto {
  id: string;
  productId: string;
  askerId: string;
  askerName: string;
  body: string;
  answers: AnswerDto[];
  createdAt: string;
}

// ── Notifications ───────────────────────────────────────────

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string | null;
  dataJson: string | null;
  read: boolean;
  createdAt: string;
}

// ── Coupons ─────────────────────────────────────────────────

export interface CouponDto {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrder: number;
  discount: number;
}

export interface AdminCouponDto {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrder?: number;
  maxUses?: number;
  startsAt: string;
  expiresAt: string;
  isActive:boolean
}

// ── Loyalty ─────────────────────────────────────────────────

export interface LoyaltyTransactionDto {
  id: string;
  type: 'EARN' | 'REDEEM' | 'BONUS' | 'REFERRAL';
  points: number;
  description: string;
  orderId: string | null;
  createdAt: string;
}

export interface LoyaltyAccountDto {
  userId: string;
  balance: number;
  balanceAsDollars: number;
  lifetimeSpend: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  referralCode: string;
  recentTransactions: LoyaltyTransactionDto[];
}

// ── Cart ────────────────────────────────────────────────────

export interface CartItemDto {
  id: number;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  savedForLater: boolean;
  addedAt: string;
}

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ── Refund ───────────────────────────────────────────────────

export interface RefundRequestDto {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateRefundRequest {
  reason: string;
}

// ── Events ──────────────────────────────────────────────────

export type EventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'CLICK'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT_START'
  | 'PURCHASE'
  | 'SEARCH'
  | 'WISHLIST_ADD';

export interface TrackingEvent {
  eventType: EventType;
  userId?: string;
  productId?: string;
  sessionId?: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

// ── Analytics ─────────────────────────────────────────────────

export interface TopProductDto {
  productId: string;
  productName: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  views: number;
  addToCarts: number;
  purchases: number;
  viewToPurchaseRate: number;
}

export interface ConsumerRecommendationDto {
  productId: string;
  productName: string;
  score: number;
  reason: string;
}

export interface HistoricalDailySalesDto {
  salesDay: string;
  orderCount: number;
  revenue: number;
}

export interface HistoricalEventFunnelDto {
  eventType: string;
  eventCount: number;
}

export interface CategorySalesDto {
  category: string;
  orderCount: number;
  unitsSold: number;
  revenue: number;
}

export interface SellerPerformanceDto {
  sellerId: string;
  sellerName: string;
  productCount: number;
  orderCount: number;
  unitsSold: number;
  revenue: number;
}

export interface InventoryRiskDto {
  productId: string;
  productName: string;
  category: string;
  sellerId: string | null;
  stockQuantity: number;
  reorderThreshold: number;
  unitsSold: number;
  viewCount: number;
  riskScore: number;
}

export interface MonthlySalesDto {
  salesMonth: string;
  orderCount: number;
  revenue: number;
}

export interface CustomerValueDto {
  customerId: string;
  customerName: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface AnalyticsSummaryDto {
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  ordersToday: number;
  orders7d: number;
  orders30d: number;
  activeUsersLastHour: number;
  activeUsers7d: number;
  newUsers7d: number;
  cancelledOrders7d: number;
  averageOrderValue7d: number;
  conversion7d: number;
  productViews7d: number;
  addToCart7d: number;
  purchases7d: number;
  viewToCartRate7d: number;
  cartToPurchaseRate7d: number;
  consumerRecommendations: ConsumerRecommendationDto[];
  topProducts: TopProductDto[];
  historicalDailySales: HistoricalDailySalesDto[];
  historicalTopProducts: TopProductDto[];
  historicalEventFunnel: HistoricalEventFunnelDto[];
  categorySales: CategorySalesDto[];
  sellerPerformance: SellerPerformanceDto[];
  inventoryRisk: InventoryRiskDto[];
  monthlySales: MonthlySalesDto[];
  customerValue: CustomerValueDto[];
}

export interface SellerProductAnalyticsDto {
  productId: string;
  productName: string;
  imageUrl: string | null;
  active: boolean;
  views: number;
  addToCarts: number;
  purchases: number;
  viewToCartRate: number;
  viewToPurchaseRate: number;
}

export interface SellerAnalyticsDto {
  days: number;
  totalViews: number;
  totalAddToCarts: number;
  totalPurchases: number;
  viewToCartRate: number;
  viewToPurchaseRate: number;
  products: SellerProductAnalyticsDto[];
}

// ── Messaging ────────────────────────────────────────────────

export interface MessageDto {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  body: string;
  sentAt: string;
}

export interface SendMessageRequest {
  body: string;
}

// ── Realtime Events ─────────────────────────────────────────

export interface OrderStatusChangedEvent {
  orderId: string;
  status: string;
}

export interface NewOrderEvent {
  orderId: string;
  total: number;
}

export interface RefundEvent {
  refundId: string;
  orderId: string;
}

export type SseEventName =
  | 'unread-count'
  | 'notification'
  | 'order-status-changed'
  | 'new-order'
  | 'new-message'
  | 'refund-requested'
  | 'refund-approved'
  | 'refund-rejected'
  | 'admin-event';

// ── Shared ──────────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  errorCode?: string;
}

export interface AccountStatusResponse {
  status: 'ACTIVE' | 'DISABLED' | 'DELETED';
}

// ── Bulk Product Upload ──────────────────────────────────────

export interface BulkRowError {
  row: number;
  message: string;
}

export interface BulkCreateResult {
  created: number;
  failed: number;
  errors: BulkRowError[];
}
