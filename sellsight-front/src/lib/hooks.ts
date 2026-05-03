/**
 * Reusable React Query hooks for all data fetching and mutations.
 * Import from here instead of writing inline useQuery/useMutation calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authApi, productApi, orderApi, reviewApi, wishlistApi,
  questionApi, notificationApi, couponApi, loyaltyApi, addressApi,
  cartApi, refundApi, subscriptionApi, adminApi, messageApi, recentlyViewedApi,
} from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import type { CreateOrderRequest, CreateReviewRequest, AddressDto, CreateRefundRequest, UpdateProfileRequest, CreateCouponRequest, SendMessageRequest } from '@shared/types';
import type { ProductFormValues, CreateProductFormValues } from '@/lib/schemas';

// ── Internal helper ──────────────────────────────────────────

function apiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

// ── Auth / Profile ───────────────────────────────────────────

export function useProfile() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const login = useAuthStore((s) => s.login);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const sellerStatus = useAuthStore((s) => s.sellerStatus);
  return useMutation({
    mutationFn: (req: UpdateProfileRequest) => authApi.updateProfile(req),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      login({
        token: null,
        email: updated.email,
        role: updated.role,
        firstName: updated.firstName,
        lastName: updated.lastName,
        emailVerified,
        sellerStatus,
      });
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(apiError(err, 'Failed to update profile')),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(oldPassword, newPassword),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (err) => toast.error(apiError(err, 'Failed to change password')),
  });
}

// Avatar upload constraints — keep in sync with backend UploadAvatarUseCase.
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      if (file.size > AVATAR_MAX_BYTES) {
        return Promise.reject(new Error('Image must be 5MB or smaller'));
      }
      if (!AVATAR_ALLOWED_MIME.includes(file.type as typeof AVATAR_ALLOWED_MIME[number])) {
        return Promise.reject(new Error('Use JPEG, PNG, or WebP'));
      }
      return authApi.uploadAvatar(file);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated');
    },
    onError: (err) => toast.error(apiError(err, (err as Error).message ?? 'Upload failed')),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.deleteAvatar(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar removed');
    },
    onError: (err) => toast.error(apiError(err, 'Failed to remove avatar')),
  });
}

export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      logout();
      toast.success('Account deleted. Goodbye!');
      router.push('/');
    },
    onError: (err) => toast.error(apiError(err, 'Failed to delete account')),
  });
}

// ── Products ─────────────────────────────────────────────────

export function useProducts(page: number, size: number, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['products', page, size, filters],
    queryFn: () => productApi.getAll(page, size, filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

export function useSellerProducts(sellerId: string | undefined, page = 0, size = 100) {
  return useQuery({
    queryKey: ['seller-products', sellerId, page, size],
    queryFn: () => productApi.getBySeller(sellerId!, page, size),
    enabled: !!sellerId,
  });
}

export function useSearchProducts(query: string, page = 0, size = 12) {
  return useQuery({
    queryKey: ['product-search', query, page, size],
    queryFn: () => productApi.search(query, page, size),
    enabled: query.length >= 2,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (req: CreateProductFormValues) =>
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

export function useMyOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
    enabled: isAuthenticated,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
}

export function useAllOrders() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: orderApi.getAll,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useSellerOrders() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['seller-orders'],
    queryFn: orderApi.getSellerOrders,
    enabled: isAuthenticated && role === 'SELLER',
  });
}

export function useCreateOrder() {
  const clearLocalCart = useCartStore((s) => s.clearCart);
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (req: CreateOrderRequest) => orderApi.create(req),
    onSuccess: (order) => {
      clearLocalCart();
      cartApi.clear().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to place order'));
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: () => toast.error('Failed to update order status'),
  });
}

// ── Reviews ──────────────────────────────────────────────────

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getByProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateReviewRequest) => reviewApi.create(req),
    onSuccess: (_data, variables) => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to submit review'));
    },
  });
}

export function useVoteReviewHelpful(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.voteHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success('Marked as helpful!');
    },
    onError: (err) => toast.error(apiError(err, 'Already voted or failed')),
  });
}

// ── Wishlists ────────────────────────────────────────────────

export function useWishlists() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['wishlists'],
    queryFn: wishlistApi.getAll,
    enabled: isAuthenticated,
  });
}

export function useCreateWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => wishlistApi.create(name),
    onSuccess: () => {
      toast.success('Wishlist created!');
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
    onError: () => toast.error('Failed to create wishlist'),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wishlistId, productId }: { wishlistId: string; productId: string }) =>
      wishlistApi.addItem(wishlistId, productId),
    onSuccess: () => {
      toast.success('Added to wishlist!');
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
    onError: () => toast.error('Failed to add to wishlist'),
  });
}


export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wishlistId, productId }: { wishlistId: string; productId: string }) =>
      wishlistApi.removeItem(wishlistId, productId),
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
    onError: () => toast.error('Failed to remove from wishlist'),
  });
}

export function useSetDefaultWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wishlistId: string) => wishlistApi.setDefault(wishlistId),
    onSuccess: () => {
      toast.success('Default wishlist updated');
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
    onError: () => toast.error('Failed to update default wishlist'),
  });
}

// ── Q&A ──────────────────────────────────────────────────────

export function useProductQuestions(productId: string) {
  return useQuery({
    queryKey: ['questions', productId],
    queryFn: () => questionApi.getByProduct(productId),
    enabled: !!productId,
  });
}

export function useAskQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: string }) =>
      questionApi.ask(productId, body),
    onSuccess: (_data, { productId }) => {
      toast.success('Question submitted!');
      queryClient.invalidateQueries({ queryKey: ['questions', productId] });
    },
    onError: () => toast.error('Failed to submit question'),
  });
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: string; body: string }) =>
      questionApi.answer(questionId, body),
    onSuccess: () => {
      toast.success('Answer submitted!');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: () => toast.error('Failed to submit answer'),
  });
}

// ── Notifications ────────────────────────────────────────────

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getAll,
    enabled: isAuthenticated,
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: notificationApi.countUnread,
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

// ── Coupons ──────────────────────────────────────────────────

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponApi.validate(code, subtotal),
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Invalid coupon code'));
    },
  });
}

// ── Loyalty ──────────────────────────────────────────────────

export function useLoyaltyAccount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['loyalty'],
    queryFn: loyaltyApi.getAccount,
    enabled: isAuthenticated,
  });
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ points, orderId }: { points: number; orderId: string }) =>
      loyaltyApi.redeem(points, orderId),
    onSuccess: () => {
      toast.success('Points redeemed!');
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
    onError: (err: unknown) => {
      toast.error(apiError(err, 'Failed to redeem points'));
    },
  });
}

// ── Addresses ────────────────────────────────────────────────

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getAll,
    enabled: isAuthenticated,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddressDto) => addressApi.create(dto),
    onSuccess: () => {
      toast.success('Address saved!');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: () => toast.error('Failed to save address'),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddressDto }) => addressApi.update(id, dto),
    onSuccess: () => {
      toast.success('Address updated!');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: () => toast.error('Failed to update address'),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: () => toast.error('Failed to delete address'),
  });
}

// ── Cart (DB-backed) ─────────────────────────────────────────

export function useCart() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated && role === 'CUSTOMER',
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to add to cart')),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to update cart'),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: () => {
      toast.success('Removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => toast.error('Failed to remove from cart'),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ── Refunds ──────────────────────────────────────────────────

export function useRequestRefund(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateRefundRequest) => refundApi.request(orderId, req),
    onSuccess: () => {
      toast.success('Refund request submitted!');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to submit refund request')),
  });
}

export function useRefundStatus(orderId: string) {
  return useQuery({
    queryKey: ['refund', orderId],
    queryFn: () => refundApi.getStatus(orderId),
    enabled: !!orderId,
    retry: false,
  });
}

// ── Recently viewed (server-backed) ─────────────────────────

export function useRecentlyViewedProducts() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['recently-viewed'],
    queryFn: recentlyViewedApi.getAll,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

export function useRecordRecentlyViewed() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (productId: string) => recentlyViewedApi.record(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recently-viewed'] }),
    onError: () => { /* silent — non-critical */ },
    meta: { skipToast: true },
  });
}

// ── Price drop subscriptions ─────────────────────────────────

export function usePriceDropSubscription(productId: string) {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['price-drop-sub', productId],
    queryFn: () => subscriptionApi.checkPriceDrop(productId),
    enabled: !!productId && isAuthenticated && role === 'CUSTOMER',
    retry: false,
  });
}

export function useTogglePriceDropSubscription(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscribed }: { subscribed: boolean }) =>
      subscribed
        ? subscriptionApi.unsubscribePriceDrop(productId)
        : subscriptionApi.subscribePriceDrop(productId),
    onSuccess: (_data, { subscribed }) => {
      toast.success(subscribed ? 'Unsubscribed from price alerts' : 'You\'ll be notified of price drops!');
      queryClient.invalidateQueries({ queryKey: ['price-drop-sub', productId] });
    },
    onError: (err) => toast.error(apiError(err, 'Failed to update subscription')),
  });
}

// ── Back-in-stock subscriptions ──────────────────────────────

export function useBackInStockSubscription(productId: string) {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['back-in-stock-sub', productId],
    queryFn: () => subscriptionApi.checkBackInStock(productId),
    enabled: !!productId && isAuthenticated && role === 'CUSTOMER',
    retry: false,
  });
}

export function useToggleBackInStockSubscription(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscribed }: { subscribed: boolean }) =>
      subscribed
        ? subscriptionApi.unsubscribeBackInStock(productId)
        : subscriptionApi.subscribeBackInStock(productId),
    onSuccess: (_data, { subscribed }) => {
      toast.success(subscribed ? 'Alert removed' : "We'll notify you when it's back in stock!");
      queryClient.invalidateQueries({ queryKey: ['back-in-stock-sub', productId] });
    },
    onError: (err) => toast.error(apiError(err, 'Failed to update alert')),
  });
}

// ── Admin ────────────────────────────────────────────────────

export function useAdminUsers() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useAdminCoupons() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: adminApi.getCoupons,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateCouponRequest) => adminApi.createCoupon(req),
    onSuccess: () => {
      toast.success('Coupon created!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to create coupon')),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });
}

// ── Seller Management ────────────────────────────────────────

export function usePendingSellers() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['pending-sellers'],
    queryFn: adminApi.getPendingSellers,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useApproveSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveSeller(id),
    onSuccess: () => {
      toast.success('Seller approved!');
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to approve seller')),
  });
}

export function useRejectSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectSeller(id),
    onSuccess: () => {
      toast.success('Seller application rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to reject seller')),
  });
}

// ── Coupon toggle ────────────────────────────────────────────

export function useToggleCouponActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.toggleCouponActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to update coupon')),
  });
}

// ── Admin refunds ────────────────────────────────────────────

export function useAdminRefunds() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-refunds'],
    queryFn: adminApi.listRefunds,
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useApproveRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId: string) => adminApi.approveRefund(refundId),
    onSuccess: () => {
      toast.success('Refund approved and Stripe refund issued');
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to approve refund')),
  });
}

export function useRejectRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId: string) => adminApi.rejectRefund(refundId),
    onSuccess: () => {
      toast.success('Refund rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to reject refund')),
  });
}

// ── Messaging ────────────────────────────────────────────────

export function useOrderMessages(orderId: string) {
  return useQuery({
    queryKey: ['messages', orderId],
    queryFn: () => messageApi.getMessages(orderId),
    enabled: !!orderId,
    // WS subscription + SSE fallback keep cache fresh in real-time.
    // 60s poll is a safety net for missed events (page focus loss, reconnects).
    refetchInterval: 60_000,
  });
}

export function useSendMessage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SendMessageRequest) => messageApi.sendMessage(orderId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to send message')),
  });
}

export function useAdminUserList(params: {
  search?: string; role?: string; status?: string;
  page?: number; size?: number; sort?: string;
}) {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-users-v2', params],
    queryFn: () => adminApi.listUsers(params),
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useAdminUserDetail(userId: string | null) {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminApi.getUser(userId!),
    enabled: isAuthenticated && role === 'ADMIN' && userId != null,
  });
}

export function useDisableUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.disableUser(userId),
    onSuccess: () => {
      toast.success('User disabled');
      queryClient.invalidateQueries({ queryKey: ['admin-users-v2'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to disable user')),
  });
}

export function useEnableUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.enableUser(userId),
    onSuccess: () => {
      toast.success('User enabled');
      queryClient.invalidateQueries({ queryKey: ['admin-users-v2'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to enable user')),
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.changeUserRole(userId, { role: role as import('@shared/types').Role }),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users-v2'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to change role')),
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users-v2'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to delete user')),
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.restoreUser(userId),
    onSuccess: () => {
      toast.success('Account restored');
      queryClient.invalidateQueries({ queryKey: ['admin-users-v2'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to restore account')),
  });
}

export function useAdminRevokeUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.revokeUserSessions(userId),
    onSuccess: () => {
      toast.success('All sessions revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to revoke sessions')),
  });
}

export function useAdminSessions() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => adminApi.listAllSessions(),
    enabled: isAuthenticated && role === 'ADMIN',
  });
}

export function useAdminRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => adminApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to revoke session')),
  });
}

export function useAdminRevokeFamilySessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (familyId: string) => adminApi.revokeFamilySessions(familyId),
    onSuccess: () => {
      toast.success('Token family revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
    onError: (err: unknown) => toast.error(apiError(err, 'Failed to revoke family')),
  });
}

// ── Utils ────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
