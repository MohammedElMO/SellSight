'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useOrder, useRequestRefund, useRefundStatus, useOrderMessages, useSendMessage } from '@/lib/hooks';
import { useOrderMessagesSocket } from '@/hooks/useOrderMessagesSocket';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { Package, ChevronRight, ArrowLeft, RotateCcw, Check, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ProductDto } from '@shared/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const { data: order, isLoading, isError } = useOrder(id);
  const { data: refund } = useRefundStatus(id);
  const requestRefund = useRequestRefund(id);
  const { data: messages = [] } = useOrderMessages(id);
  const sendMessage = useSendMessage(id);
  const { sendViaSocket } = useOrderMessagesSocket(id);
  const [refundReason, setRefundReason]     = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  const handleSendMessage = () => {
    const body = msgInput.trim();
    if (!body) return;
    // Try WS first; fall back to HTTP mutation
    const sentViaWs = sendViaSocket(body);
    if (!sentViaWs) {
      sendMessage.mutate({ body });
    }
    setMsgInput('');
  };

  const handleRefundSubmit = () => {
    if (refundReason.trim().length < 10) {
      toast.error('Please provide at least 10 characters for the reason');
      return;
    }
    requestRefund.mutate({ reason: refundReason }, {
      onSuccess: () => { setShowRefundModal(false); setRefundReason(''); },
    });
  };

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      const stub: ProductDto = {
        id: item.productId, name: item.productName, description: '',
        price: item.unitPrice, category: '', sellerId: '', imageUrl: null,
        brand: null, ratingAvg: 0, ratingCount: 0, soldCount: 0,
        active: true, createdAt: '', updatedAt: null, stockQuantity: 99,
      };
      addItem(stub, item.quantity);
    });
    toast.success('Items added to cart!');
    router.push('/cart');

  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-5">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-32 rounded-[var(--radius)]" />
        <Skeleton className="h-48 rounded-[var(--radius)]" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="w-full">
        <EmptyState
          icon={Package}
          title="Order not found"
          action={
            <MagButton onClick={() => router.push('/orders')} variant="primary">
              Back to orders
            </MagButton>
          }
        />
      </div>
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <Reveal>
        <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] mb-7">
          <Link href="/orders" className="hover:text-[var(--accent-text)] transition-colors">Orders</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-mono text-[var(--text-primary)] font-medium">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </nav>
      </Reveal>

      <div className="max-w-2xl flex flex-col gap-4">
        {/* Header */}
        <Reveal delay={40}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] text-[var(--text-tertiary)] mb-1">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[13px] text-[var(--text-secondary)]">Placed on {formatDate(order.createdAt)}</p>
              {order.updatedAt && (
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Updated {formatDate(order.updatedAt)}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <MagButton size="sm" variant="secondary" onClick={handleReorder}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reorder
                </MagButton>
                <MagButton size="sm" variant="ghost" onClick={() => toast.info('Invoice generation coming soon')}>
                  Download Invoice
                </MagButton>
                {order.status === 'DELIVERED' && !refund && (
                  <MagButton size="sm" variant="danger" onClick={() => setShowRefundModal(true)}>
                    Request Return
                  </MagButton>
                )}
                {refund && (
                  <span className="h-9 px-3 text-[12px] font-medium flex items-center rounded-[var(--radius-xs)] border border-[var(--border)] text-[var(--text-secondary)]">
                    Refund {refund.status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
        </Reveal>

        {/* Progress */}
        <Reveal delay={80}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">Order Status</h2>
            <OrderProgress status={order.status} />
          </div>
        </Reveal>

        {/* Items */}
        <Reveal delay={120}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">Items ({itemCount})</h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4 py-3 border-t border-[var(--border-subtle)] first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-[var(--radius-xs)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]"
                      style={{ background: 'var(--surface)' }}
                    >
                      <Package className="h-4 w-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                        {item.productName}
                      </p>
                      <p className="text-[12px] text-[var(--text-tertiary)]">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[var(--text-primary)] shrink-0">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Summary */}
        <Reveal delay={160}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--text-secondary)]">Subtotal ({itemCount} items)</span>
                <span className="text-[var(--text-primary)]">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--text-secondary)]">Shipping</span>
                <span className="font-medium" style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div className="flex justify-between font-display font-bold text-[16px] text-[var(--text-primary)] pt-3 border-t border-[var(--border-subtle)]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Messaging */}
        <Reveal delay={200}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[var(--accent)]" />
              Messages
            </h2>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">
                  No messages yet. Ask the seller a question.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-0.5 ${m.senderRole === 'CUSTOMER' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-[var(--text-tertiary)] px-1 capitalize">{m.senderRole.toLowerCase()}</span>
                    <div
                      className="max-w-[80%] rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
                      style={m.senderRole === 'CUSTOMER'
                        ? { background: 'var(--accent)', color: 'white' }
                        : { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                      {m.body}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && msgInput.trim()) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask the seller a question…"
                className="flex-1 h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
              <MagButton
                size="sm"
                variant="primary"
                disabled={!msgInput.trim() || sendMessage.isPending}
                onClick={handleSendMessage}
              >
                <Send className="h-3.5 w-3.5" />
              </MagButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <button
            onClick={() => router.push('/orders')}
            className="self-start flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent-text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </button>
        </Reveal>
      </div>

      {/* Refund modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-xl">
            <h2 className="font-display font-bold text-[16px] text-[var(--text-primary)] mb-1">Request Return / Refund</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">Please describe the reason for your return.</p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={4}
              placeholder="e.g. Item arrived damaged, wrong item received..."
              className="w-full text-[13px] border border-[var(--border)] rounded-[var(--radius-sm)] p-3 resize-none outline-none bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors"
              style={{ ['--tw-ring-color' as string]: 'var(--accent)' }}
            />
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1 mb-4">{refundReason.length}/1000</p>
            <div className="flex gap-2 justify-end">
              <MagButton variant="ghost" size="sm" onClick={() => setShowRefundModal(false)}>Cancel</MagButton>
              <MagButton
                variant="danger"
                size="sm"
                onClick={handleRefundSubmit}
                disabled={requestRefund.isPending}
              >
                {requestRefund.isPending ? 'Submitting…' : 'Submit Request'}
              </MagButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;
type Step = typeof ORDER_STEPS[number];

function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--danger)' }}>
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--danger)' }} />
        This order was cancelled
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(status as Step);

  return (
    <div className="flex items-center">
      {ORDER_STEPS.map((step, i) => {
        const done   = i <= currentIndex;
        const active = i === currentIndex;
        const last   = i === ORDER_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={done
                  ? { background: 'var(--accent)', color: 'white', boxShadow: active ? '0 0 0 4px var(--accent-glow)' : undefined }
                  : { background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
              >
                {done && !active ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap capitalize"
                style={{ color: done ? 'var(--accent-text)' : 'var(--text-tertiary)' }}
              >
                {step.toLowerCase()}
              </span>
            </div>
            {!last && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all"
                style={{ background: i < currentIndex ? 'var(--accent)' : 'var(--border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
