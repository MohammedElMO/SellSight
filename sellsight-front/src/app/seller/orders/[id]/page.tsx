'use client';

import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { useOrder, useUpdateOrderStatus } from '@/lib/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Package, Check } from 'lucide-react';
import Link from 'next/link';
import type { OrderStatus } from '@shared/types';
import { toast } from 'sonner';

const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function statusVariant(s: string): 'accent' | 'success' | 'danger' | 'secondary' | 'subtle' {
  if (s === 'DELIVERED') return 'success';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'SHIPPED')   return 'secondary';
  return 'accent';
}

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

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
      </div>
    </PageLayout>
  );

  const currentStep = STEPS.indexOf(order.status);

  const handleAdvance = () => {
    const next = STEPS[currentStep + 1] as OrderStatus;
    if (!next) return;
    updateStatus({ id: order.id, status: next }, {
      onSuccess: () => toast.success(`Order marked as ${next.toLowerCase()}`),
    });
  };

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] mb-6">
          <Link href="/seller/orders" className="hover:text-[var(--text-primary)] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Orders
          </Link>
          <span>›</span>
          <span className="text-[var(--text-primary)] font-medium">#{order.id.toString().slice(-6)}</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Order #{order.id.toString().slice(-6)}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <Pill variant={statusVariant(order.status)}>{order.status.toLowerCase()}</Pill>
        </div>
      </Reveal>

      {/* Progress tracker */}
      {order.status !== 'CANCELLED' && (
        <Reveal delay={100}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-7 mb-5">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 flex-none">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-400"
                      style={{
                        background: i <= currentStep ? 'var(--accent)' : 'var(--surface)',
                        color: i <= currentStep ? 'white' : 'var(--text-tertiary)',
                        boxShadow: i === currentStep ? '0 0 20px var(--accent-glow)' : 'none',
                      }}
                    >
                      {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className="text-[11px] capitalize"
                      style={{ color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: i === currentStep ? 600 : 400 }}
                    >
                      {step.toLowerCase()}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-2 mb-5 rounded-sm transition-all"
                      style={{ background: i < currentStep ? 'var(--accent)' : 'var(--border-subtle)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Items */}
      <Reveal delay={200}>
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
                  <p className="text-[12px] text-[var(--text-tertiary)]">Qty: {item.quantity}</p>
                </div>
                <span className="font-display font-bold text-base text-[var(--text-primary)]">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Summary + action */}
      <Reveal delay={280}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[var(--text-secondary)]">Total</p>
            <p className="font-display font-extrabold text-2xl text-[var(--text-primary)]">
              {formatPrice(order.total)}
            </p>
          </div>
          {currentStep < STEPS.length - 1 && order.status !== 'CANCELLED' && (
            <MagButton variant="primary" onClick={handleAdvance} disabled={isPending}>
              Mark as {STEPS[currentStep + 1]?.toLowerCase() ?? ''}
            </MagButton>
          )}
        </div>
      </Reveal>
    </PageLayout>
  );
}
