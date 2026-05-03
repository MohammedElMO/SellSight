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
  AutocompleteDto,
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
  SellerApplicationDto,
  MessageDto,
  SendMessageRequest,
  SessionDto,
  AdminUserDto,
  AdminUserPageDto,
  ChangeRoleRequest,
  LandingDto,
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
  refreshToken: () =>
    api.post<AuthResponse>('/auth/refresh').then((r) => r.data),
  refresh: () =>
    api.post<AuthResponse>('/auth/refresh').then((r) => r.data),
  logout: () =>
    api.post<void>('/auth/logout'),
  logoutAll: () =>
    api.post<void>('/auth/logout-all'),
  getSessions: () =>
    api.get<SessionDto[]>('/users/me/sessions').then((r) => r.data),
  revokeSession: (id: string) =>
    api.post<void>(`/users/me/sessions/${id}/revoke`),
  revokeAllSessions: () =>
    api.post<void>('/users/me/sessions/revoke-all'),
  resendVerification: (email: string) =>
    api.post<void>('/auth/resend-verification', { email }),
  checkAccountStatus: (email: string) =>
    api.get<import('@shared/types').AccountStatusResponse>('/auth/account-status', { params: { email } }).then(r => r.data),
  deleteAccount: () =>
    api.delete<void>('/users/me'),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api
      .post<UserDto>('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  deleteAvatar: () =>
    api.delete<UserDto>('/users/me/avatar').then((r) => r.data),
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
  autocomplete: (query: string, limit = 8) =>
    api.get<AutocompleteDto[]>('/products/autocomplete', { params: { q: query, limit } }).then((r) => r.data),
  create: (req: CreateProductRequest) =>
    api.post<ProductDto>('/products', req).then((r) => r.data),
  update: (id: string, req: UpdateProductRequest) =>
    api.put<ProductDto>(`/products/${id}`, req).then((r) => r.data),
  delete: (id: string) =>
    api.delete<void>(`/products/${id}`),
  getLanding: () =>
    api.get<LandingDto>('/products/landing').then((r) => r.data),
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
  setDefault: (wishlistId: string) =>
    api.put<WishlistDto>(`/wishlists/${wishlistId}/default`).then((r) => r.data),
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
  subscribeBackInStock: (productId: string) =>
    api.post<void>(`/subscriptions/back-in-stock/${productId}`),
  unsubscribeBackInStock: (productId: string) =>
    api.delete<void>(`/subscriptions/back-in-stock/${productId}`),
  checkBackInStock: (productId: string) =>
    api.get<{ subscribed: boolean }>(`/subscriptions/back-in-stock/${productId}`).then((r) => r.data),
};

export const recentlyViewedApi = {
  record: (productId: string) =>
    api.post<void>('/users/me/recently-viewed', null, { params: { productId } }),
  getAll: () =>
    api.get<ProductDto[]>('/users/me/recently-viewed').then((r) => r.data),
};

// ── Events ───────────────────────────────────────────────────

export const eventApi = {
  track: (events: Record<string, unknown>[]) =>
    api.post<void>('/v1/events', { events }),
};

// ── Payments ─────────────────────────────────────────────────

export const paymentApi = {
  createIntent: (req: CreatePaymentIntentRequest) =>
    api.post<{ clientSecret: string | null }>('/payments/create-intent', req).then((r) => r.data),
  confirmFree: (orderId: string) =>
    api.post<OrderDto>(`/payments/confirm-free/${orderId}`).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────

export const adminApi = {
  // legacy — kept for existing hooks that haven't migrated yet
  getUsers: () =>
    api.get<UserDto[]>('/users').then((r) => r.data),

  // ── User management ──────────────────────────────────────
  listUsers: (params?: {
    search?: string; role?: string; status?: string;
    page?: number; size?: number; sort?: string;
  }) =>
    api.get<AdminUserPageDto>('/admin/users', { params }).then((r) => r.data),
  getUser: (userId: string) =>
    api.get<AdminUserDto>(`/admin/users/${userId}`).then((r) => r.data),
  disableUser: (userId: string) =>
    api.post<void>(`/admin/users/${userId}/disable`),
  enableUser: (userId: string) =>
    api.post<void>(`/admin/users/${userId}/enable`),
  changeUserRole: (userId: string, req: ChangeRoleRequest) =>
    api.patch<AdminUserDto>(`/admin/users/${userId}/role`, req).then((r) => r.data),
  deleteUser: (userId: string) =>
    api.delete<void>(`/admin/users/${userId}`),
  restoreUser: (userId: string) =>
    api.post<void>(`/admin/users/${userId}/restore`),
  revokeUserSessions: (userId: string) =>
    api.post<void>(`/admin/users/${userId}/sessions/revoke-all`),

  // ── Session management ───────────────────────────────────
  listAllSessions: () =>
    api.get<SessionDto[]>('/admin/sessions').then((r) => r.data),
  listUserSessions: (userId: string) =>
    api.get<SessionDto[]>(`/admin/sessions/user/${userId}`).then((r) => r.data),
  getSession: (sessionId: string) =>
    api.get<SessionDto>(`/admin/sessions/${sessionId}`).then((r) => r.data),
  revokeSession: (sessionId: string) =>
    api.post<void>(`/admin/sessions/${sessionId}/revoke`),
  revokeAllSessionsForUser: (userId: string) =>
    api.post<void>(`/admin/sessions/user/${userId}/revoke-all`),
  revokeFamilySessions: (familyId: string) =>
    api.post<void>(`/admin/sessions/families/${familyId}/revoke`),

  getCoupons: () =>
    api.get<AdminCouponDto[]>('/coupons').then((r) => r.data),
  createCoupon: (req: CreateCouponRequest) =>
    api.post<AdminCouponDto>('/coupons', req).then((r) => r.data),
  deleteCoupon: (id: string) =>
    api.delete<void>(`/coupons/${id}`),
  toggleCouponActive: (id: string, active: boolean) =>
    api.patch<AdminCouponDto>(`/coupons/${id}/active`, { active }).then((r) => r.data),
  listRefunds: () =>
    api.get<RefundRequestDto[]>('/orders/refunds').then((r) => r.data),
  approveRefund: (refundId: string) =>
    api.post<RefundRequestDto>(`/orders/refunds/${refundId}/approve`).then((r) => r.data),
  rejectRefund: (refundId: string) =>
    api.post<RefundRequestDto>(`/orders/refunds/${refundId}/reject`).then((r) => r.data),
  getPendingSellers: () =>
    api.get<SellerApplicationDto[]>('/users/sellers/pending').then((r) => r.data),
  approveSeller: (id: string) =>
    api.post<void>(`/users/sellers/${id}/approve`),
  rejectSeller: (id: string) =>
    api.post<void>(`/users/sellers/${id}/reject`),
};

// ── Messaging ────────────────────────────────────────────────

export const messageApi = {
  getMessages: (orderId: string) =>
    api.get<MessageDto[]>(`/orders/${orderId}/messages`).then((r) => r.data),
  sendMessage: (orderId: string, req: SendMessageRequest) =>
    api.post<MessageDto>(`/orders/${orderId}/messages`, req).then((r) => r.data),
};
