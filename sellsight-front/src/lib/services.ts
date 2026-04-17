import api from '@/lib/api';
import type {
  LoginRequest,
  RegisterRequest,
  OAuthLoginRequest,
  AuthResponse,
  UserDto,
  ProductDto,
  ProductPageDto,
  CreateProductRequest,
  UpdateProductRequest,
  OrderDto,
  CreateOrderRequest,
  StockDto,
  UpdateStockRequest,
} from '@shared/types';

// ── Auth ────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  oauthLogin: (data: OAuthLoginRequest) =>
    api.post<AuthResponse>('/auth/oauth', data).then((r) => r.data),

  getProfile: () =>
    api.get<UserDto>('/users/me').then((r) => r.data),
};

// ── Products ────────────────────────────────────────────────

export const productApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ProductPageDto>('/products', { params: { page, size } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ProductDto>(`/products/${id}`).then((r) => r.data),

  getBySeller: (sellerId: string, page = 0, size = 20) =>
    api.get<ProductPageDto>(`/products/seller/${sellerId}`, { params: { page, size } }).then((r) => r.data),

  create: (data: CreateProductRequest) =>
    api.post<ProductDto>('/products', data).then((r) => r.data),

  update: (id: string, data: UpdateProductRequest) =>
    api.put<ProductDto>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// ── Orders ──────────────────────────────────────────────────

export const orderApi = {
  create: (data: CreateOrderRequest) =>
    api.post<OrderDto>('/orders', data).then((r) => r.data),

  getById: (id: string) =>
    api.get<OrderDto>(`/orders/${id}`).then((r) => r.data),

  getMyOrders: () =>
    api.get<OrderDto[]>('/orders/my').then((r) => r.data),

  getAll: () =>
    api.get<OrderDto[]>('/orders').then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.put<OrderDto>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

// ── Inventory ───────────────────────────────────────────────

export const inventoryApi = {
  getStock: (productId: string) =>
    api.get<StockDto>(`/inventory/${productId}`).then((r) => r.data),

  updateStock: (productId: string, data: UpdateStockRequest) =>
    api.put<StockDto>(`/inventory/${productId}`, data).then((r) => r.data),

  getLowStock: () =>
    api.get<StockDto[]>('/inventory/low-stock').then((r) => r.data),
};
