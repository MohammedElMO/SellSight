/**
 * Reusable React Query hooks for all data fetching and mutations.
 * Import from here instead of writing inline useQuery/useMutation calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, productApi, orderApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';
import type { CreateOrderRequest } from '@shared/types';
import type { ProductFormValues } from '@/lib/schemas';

// ── Internal helper ──────────────────────────────────────────

function apiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

// ── Auth / Profile ───────────────────────────────────────────

/** Fetch the current user's profile. Only runs when authenticated. */
export function useProfile() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
  });
}

// ── Products ─────────────────────────────────────────────────

/** Paginated list of all products. */
export function useProducts(page: number, size: number) {
  return useQuery({
    queryKey: ['products', page, size],
    queryFn: () => productApi.getAll(page, size),
  });
}

/** Single product by ID. */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

/** Paginated products belonging to a specific seller. */
export function useSellerProducts(sellerId: string | undefined, page = 0, size = 100) {
  return useQuery({
    queryKey: ['seller-products', sellerId, page, size],
    queryFn: () => productApi.getBySeller(sellerId!, page, size),
    enabled: !!sellerId,
  });
}

/**
 * Create a new product.
 * On success: invalidates seller-products cache and navigates to /seller/products.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (req: ProductFormValues) =>
      productApi.create({
        ...req,
        description: req.description || undefined,
        imageUrl: req.imageUrl || undefined,
      }),
    onSuccess: () => {
      toast.success('Product created!');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      router.push('/seller/products');
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to create product'));
    },
  });
}

/**
 * Update an existing product by ID.
 * On success: invalidates seller-products and the product's own cache, then navigates back.
 */
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (req: ProductFormValues) =>
      productApi.update(id, {
        ...req,
        description: req.description || undefined,
        imageUrl: req.imageUrl || undefined,
      }),
    onSuccess: () => {
      toast.success('Product updated!');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.push('/seller/products');
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to update product'));
    },
  });
}

/**
 * Delete a product by ID.
 * On success: invalidates seller-products cache.
 * Pass `{ onSuccess }` to `mutate()` for any extra page-level cleanup (e.g. closing a modal).
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });
}

// ── Orders ───────────────────────────────────────────────────

/** Current user's own orders. Only runs when authenticated. */
export function useMyOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
    enabled: isAuthenticated,
  });
}

/** Single order by ID. */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
}

/** All orders across all customers. Only runs for ADMIN. */
export function useAllOrders() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: orderApi.getAll,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

/**
 * Place a new order from the cart.
 * On success: clears cart and navigates to the new order's detail page.
 */
export function useCreateOrder() {
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();
  return useMutation({
    mutationFn: (req: CreateOrderRequest) => orderApi.create(req),
    onSuccess: (order) => {
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to place order'));
    },
  });
}

/**
 * Update an order's status (admin only).
 * On success: invalidates all-orders cache.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
    onError: () => toast.error('Failed to update order status'),
  });
}
