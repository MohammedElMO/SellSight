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
  token: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  sellerStatus: string | null;
}

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerApplicationDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sellerStatus: SellerStatus;
  createdAt: string;
}

// ── User ────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string; // ISO 8601
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

// ── Shared ──────────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}
