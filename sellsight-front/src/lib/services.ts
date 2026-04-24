/**
 * Typed API service calls. Every function maps to one backend REST endpoint.
 * Uses the shared Axios instance configured in ./api.ts.
 */

import api from './api';
import type {
  LoginRequest,
  RegisterRequest,
  OAuthLoginRequest,
  AuthResponse,
  UserDto,
  UpdateProfileRequest,
  ProductDto,
  ProductPageDto,
  CreateProductRequest,
  UpdateProductRequest,
  OrderDto,
  CreateOrderRequest,
  CreatePaymentIntentRequest,
  StockDto,
  UpdateStockRequest,
  BatchUpdateStockItem,
  ReviewDto,
  CreateReviewRequest,
  WishlistDto,
  QuestionDto,
  NotificationDto,
  CouponDto,
  AdminCouponDto,
  CreateCouponRequest,
  LoyaltyAccountDto,
  AddressDto,
  CartDto,
  RefundRequestDto,
  CreateRefundRequest,
} from '@shared/types';

// ── Auth ─────────────────────────────────────────────────────

export const authApi = {
  register: (req: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', req).then((r) => r.data),
  login: (req: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', req).then((r) => r.data),
  oauthLogin: (req: OAuthLoginRequest) =>
    api.post<AuthResponse>('/auth/oauth', req).then((r) => r.data),
  getProfile: () =>
    api.get<UserDto>('/users/me').then((r) => r.data),
  updateProfile: (req: UpdateProfileRequest) =>
    api.put<UserDto>('/users/me', req).then((r) => r.data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put<void>('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post<void>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<void>('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token: string) =>
    api.post<AuthResponse>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: (email: string) =>
    api.post<void>('/auth/resend-verification', { email }),
  deleteAccount: () =>
    api.delete<void>('/users/me'),
};

// ── Products ─────────────────────────────────────────────────

export const productApi = {
  getAll: (page = 0, size = 12, filters?: Record<string, string>) =>
    api.get<ProductPageDto>('/products', { params: { page, size, ...filters } }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ProductDto>(`/products/${id}`).then((r) => r.data),
  getBySeller: (sellerId: string, page = 0, size = 100) =>
    api.get<ProductPageDto>(`/products/seller/${sellerId}`, { params: { page, size } }).then((r) => r.data),
  search: (query: string, page = 0, size = 12) =>
    api.get<ProductPageDto>('/products/search', { params: { q: query, page, size } }).then((r) => r.data),
  create: (req: CreateProductRequest) =>
    api.post<ProductDto>('/products', req).then((r) => r.data),
  update: (id: string, req: UpdateProductRequest) =>
    api.put<ProductDto>(`/products/${id}`, req).then((r) => r.data),
  delete: (id: string) =>
    api.delete<void>(`/products/${id}`),
};

// ── Orders ───────────────────────────────────────────────────

export const orderApi = {
  create: (req: CreateOrderRequest) =>
    api.post<OrderDto>('/orders', req).then((r) => r.data),
  getMyOrders: () =>
    api.get<OrderDto[]>('/orders/my').then((r) => r.data),
  getById: (id: string) =>
    api.get<OrderDto>(`/orders/${id}`).then((r) => r.data),
  getAll: () =>
    api.get<OrderDto[]>('/orders').then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put<OrderDto>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

// ── Inventory ────────────────────────────────────────────────

export const inventoryApi = {
  getByProduct: (productId: string) =>
    api.get<StockDto>(`/inventory/${productId}`).then((r) => r.data),
  update: (productId: string, req: UpdateStockRequest) =>
    api.put<StockDto>(`/inventory/${productId}`, req).then((r) => r.data),
  batchUpdate: (items: BatchUpdateStockItem[]) =>
    api.post<StockDto[]>('/inventory/batch', { items }).then((r) => r.data),
  getLowStock: () =>
    api.get<StockDto[]>('/inventory/low-stock').then((r) => r.data),
};

// ── Reviews ──────────────────────────────────────────────────

export const reviewApi = {
  getByProduct: (productId: string) =>
    api.get<ReviewDto[]>(`/reviews/product/${productId}`).then((r) => r.data),
  create: (req: CreateReviewRequest) =>
    api.post<ReviewDto>('/reviews', req).then((r) => r.data),
  voteHelpful: (reviewId: string) =>
    api.post<void>(`/reviews/${reviewId}/helpful`),
};

// ── Wishlists ────────────────────────────────────────────────

export const wishlistApi = {
  getAll: () =>
    api.get<WishlistDto[]>('/wishlists').then((r) => r.data),
  create: (name: string) =>
    api.post<WishlistDto>('/wishlists', { name }).then((r) => r.data),
  addItem: (wishlistId: string, productId: string) =>
    api.post<WishlistDto>(`/wishlists/${wishlistId}/items`, { productId }).then((r) => r.data),
  removeItem: (wishlistId: string, productId: string) =>
    api.delete<WishlistDto>(`/wishlists/${wishlistId}/items/${productId}`).then((r) => r.data),
};

// ── Q&A ──────────────────────────────────────────────────────

export const questionApi = {
  getByProduct: (productId: string) =>
    api.get<QuestionDto[]>(`/questions/product/${productId}`).then((r) => r.data),
  ask: (productId: string, body: string) =>
    api.post<QuestionDto>('/questions', { productId, body }).then((r) => r.data),
  answer: (questionId: string, body: string) =>
    api.post<QuestionDto>(`/questions/${questionId}/answers`, { body }).then((r) => r.data),
};

// ── Notifications ────────────────────────────────────────────

export const notificationApi = {
  getAll: () =>
    api.get<NotificationDto[]>('/notifications').then((r) => r.data),
  getUnread: () =>
    api.get<NotificationDto[]>('/notifications/unread').then((r) => r.data),
  countUnread: () =>
    api.get<{ count: number }>('/notifications/unread/count').then((r) => r.data.count),
  markRead: (id: string) =>
    api.put<void>(`/notifications/${id}/read`),
  markAllRead: () =>
    api.put<void>('/notifications/read-all'),
};

// ── Coupons ──────────────────────────────────────────────────

export const couponApi = {
  validate: (code: string, subtotal: number) =>
    api.post<CouponDto>('/coupons/validate', { code, subtotal: String(subtotal) }).then((r) => r.data),
};

// ── Loyalty ──────────────────────────────────────────────────

export const loyaltyApi = {
  getAccount: () =>
    api.get<LoyaltyAccountDto>('/loyalty').then((r) => r.data),
  redeem: (points: number, orderId: string) =>
    api.post<LoyaltyAccountDto>('/loyalty/redeem', { points, orderId }).then((r) => r.data),
};

// ── Addresses ────────────────────────────────────────────────

export const addressApi = {
  getAll: () =>
    api.get<AddressDto[]>('/addresses').then((r) => r.data),
  create: (dto: AddressDto) =>
    api.post<AddressDto>('/addresses', dto).then((r) => r.data),
  update: (id: string, dto: AddressDto) =>
    api.put<AddressDto>(`/addresses/${id}`, dto).then((r) => r.data),
  delete: (id: string) =>
    api.delete<void>(`/addresses/${id}`),
};

// ── Cart ─────────────────────────────────────────────────────

export const cartApi = {
  get: () =>
    api.get<CartDto>('/cart').then((r) => r.data),
  addItem: (productId: string, quantity: number) =>
    api.post<CartDto>('/cart/items', { productId, quantity }).then((r) => r.data),
  updateItem: (productId: string, quantity: number) =>
    api.put<CartDto>(`/cart/items/${productId}`, { quantity }).then((r) => r.data),
  removeItem: (productId: string) =>
    api.delete<CartDto>(`/cart/items/${productId}`).then((r) => r.data),
  clear: () =>
    api.delete<void>('/cart'),
};

// ── Refunds ───────────────────────────────────────────────────

export const refundApi = {
  request: (orderId: string, req: CreateRefundRequest) =>
    api.post<RefundRequestDto>(`/orders/${orderId}/refund`, req).then((r) => r.data),
  getStatus: (orderId: string) =>
    api.get<RefundRequestDto>(`/orders/${orderId}/refund`).then((r) => r.data),
};

// ── Subscriptions ────────────────────────────────────────────

export const subscriptionApi = {
  subscribePriceDrop: (productId: string, targetPrice = 0) =>
    api.post<void>(`/subscriptions/price-drop/${productId}`, null, { params: { targetPrice } }),
  unsubscribePriceDrop: (productId: string) =>
    api.delete<void>(`/subscriptions/price-drop/${productId}`),
  checkPriceDrop: (productId: string) =>
    api.get<{ subscribed: boolean }>(`/subscriptions/price-drop/${productId}`).then((r) => r.data),
};

// ── Events ───────────────────────────────────────────────────

export const eventApi = {
  track: (events: Record<string, unknown>[]) =>
    api.post<void>('/v1/events', { events }),
};

// ── Payments ─────────────────────────────────────────────────

export const paymentApi = {
  createIntent: (req: CreatePaymentIntentRequest) =>
    api.post<{ clientSecret: string }>('/payments/create-intent', req).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────

export const adminApi = {
  getUsers: () =>
    api.get<UserDto[]>('/users').then((r) => r.data),
  getCoupons: () =>
    api.get<AdminCouponDto[]>('/coupons').then((r) => r.data),
  createCoupon: (req: CreateCouponRequest) =>
    api.post<AdminCouponDto>('/coupons', req).then((r) => r.data),
  deleteCoupon: (id: string) =>
    api.delete<void>(`/coupons/${id}`),
};
