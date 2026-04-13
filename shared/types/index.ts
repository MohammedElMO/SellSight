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

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
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

// ── Product ─────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
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
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductPageDto {
  products: ProductDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
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

// ── Shared ──────────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}
