'use client';

import { useParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { useOrder, useOrderMessages, useSendMessage } from '@/lib/hooks';
import { useOrderMessagesSocket } from '@/hooks/useOrderMessagesSocket';
import { orderApi } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Package, Check, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import type { OrderStatus } from '@shared/types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED',   'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

function statusVariant(s: string): 'accent' | 'success' | 'danger' | 'secondary' | 'subtle' {
  if (s === 'DELIVERED') return 'success';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'SHIPPED')   return 'secondary';
  return 'accent';
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { data: messages = [] } = useOrderMessages(id);
  const sendMessage = useSendMessage(id);
  const { sendViaSocket } = useOrderMessagesSocket(id);
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [msgInput, setMsgInput] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const displayStatus = currentStatus ?? order?.status ?? 'PENDING';
  const transitions = STATUS_TRANSITIONS[displayStatus] ?? [];
  const stepIndex = STEPS.indexOf(displayStatus);

  const handleUpdateStatus = (nextStatus: string) => {
    startTransition(async () => {
      const prev = displayStatus;
      setCurrentStatus(nextStatus);
      try {
        await orderApi.updateStatus(id, nextStatus);
        toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
        queryClient.invalidateQueries({ queryKey: ['all-orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      } catch {
        setCurrentStatus(prev);
        toast.error('Failed to update order status');
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      }
    });
  };

  const handleSendMessage = () => {
    const body = msgInput.trim();
    if (!body) return;
    const sentViaWs = sendViaSocket(body);
    if (!sentViaWs) sendMessage.mutate({ body });
    setMsgInput('');
  };

  if (isLoading) return (
    <PageLayout>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-[var(--radius)]" />)}
      </div>
    </PageLayout>
  );

  if (!order) return (
    <PageLayout>
      <div className="text-center py-20">
        <Package className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
        <p className="text-[var(--text-secondary)]">Order not found</p>
        <Link href="/admin/orders" className="text-sm text-[var(--accent)] mt-3 inline-block">
          ← Back to orders
        </Link>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <Reveal>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] mb-6">
          <Link href="/admin/orders" className="hover:text-[var(--text-primary)] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Orders
          </Link>
          <span>›</span>
          <span className="text-[var(--text-primary)] font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <Pill variant={statusVariant(displayStatus)}>{displayStatus.toLowerCase()}</Pill>
        </div>
      </Reveal>

      {/* Progress tracker */}
      {displayStatus !== 'CANCELLED' && (
        <Reveal delay={80}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-7 mb-5">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 flex-none">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300"
                      style={{
                        background: i <= stepIndex ? 'var(--accent)' : 'var(--surface)',
                        color: i <= stepIndex ? 'white' : 'var(--text-tertiary)',
                        boxShadow: i === stepIndex ? '0 0 20px var(--accent-glow)' : 'none',
                      }}
                    >
                      {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className="text-[11px] capitalize"
                      style={{
                        color: i <= stepIndex ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontWeight: i === stepIndex ? 600 : 400,
                      }}
                    >
                      {step.toLowerCase()}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-2 mb-5 rounded-sm transition-all"
                      style={{ background: i < stepIndex ? 'var(--accent)' : 'var(--border-subtle)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Customer info */}
      <Reveal delay={120}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-5">
          <h2 className="font-display font-semibold text-[14px] text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Customer</h2>
          <p className="text-[13px] font-mono text-[var(--text-secondary)]">{order.customerId}</p>
        </div>
      </Reveal>

      {/* Items */}
      <Reveal delay={160}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-5">
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.productId} className="flex items-center gap-4 py-2 border-b border-[var(--border-subtle)] last:border-0">
                <div className="w-12 h-12 rounded-[var(--radius-xs)] bg-[var(--surface)] flex items-center justify-center flex-none">
                  <Package className="h-5 w-5 text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{item.productName}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Seller: <span className="font-mono">{item.sellerId}</span> · Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-display font-bold text-base text-[var(--text-primary)]">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Summary + status actions */}
      <Reveal delay={200}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] text-[var(--text-secondary)]">Total</p>
              <p className="font-display font-extrabold text-2xl text-[var(--text-primary)]">{formatPrice(order.total)}</p>
            </div>
          </div>

          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <p className="text-[12px] text-[var(--text-tertiary)] w-full mb-1">Admin actions</p>
              {transitions.map((nextStatus) => (
                <MagButton
                  key={nextStatus}
                  size="sm"
                  variant={nextStatus === 'CANCELLED' ? 'secondary' : 'primary'}
                  disabled={isPending}
                  onClick={() => handleUpdateStatus(nextStatus)}
                  style={nextStatus === 'CANCELLED' ? { color: 'var(--danger)', borderColor: 'var(--danger-muted)' } : undefined}
                >
                  {isPending ? 'Updating…' : `→ ${nextStatus.toLowerCase()}`}
                </MagButton>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Messaging */}
      <Reveal delay={260}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[var(--accent)]" />
            Messages
          </h2>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col gap-0.5 ${m.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-[var(--text-tertiary)] px-1 capitalize">{m.senderRole.toLowerCase()}</span>
                  <div
                    className="max-w-[80%] rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
                    style={m.senderRole === 'ADMIN'
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
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && msgInput.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Send message to customer/seller…"
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
    </PageLayout>
  );
}
