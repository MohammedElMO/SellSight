'use client';

import { useState } from 'react';
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Plus, Copy, Trash2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { AdminCouponDto, CreateCouponRequest } from '@shared/types';

// ── Helpers ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Create modal ─────────────────────────────────────────────

function CreateCouponModal({ onClose }: { onClose: () => void }) {
  const { mutate: create, isPending } = useCreateCoupon();

  const [form, setForm] = useState<CreateCouponRequest>({
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minOrder: 0,
    maxUses: undefined,
    startsAt: new Date().toISOString().slice(0, 16),
    expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 16),
  });

  const set = <K extends keyof CreateCouponRequest>(k: K, v: CreateCouponRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)]">New Coupon</h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Code">
            <input
              required
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="SUMMER30"
              className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as CreateCouponRequest['type'])}
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed amount</option>
              </select>
            </Field>
            <Field label={form.type === 'PERCENTAGE' ? 'Value (%)' : 'Value ($)'}>
              <input
                required
                type="number"
                min={0.01}
                step={0.01}
                value={form.value}
                onChange={(e) => set('value', parseFloat(e.target.value))}
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min order ($)">
              <input
                type="number"
                min={0}
                value={form.minOrder ?? 0}
                onChange={(e) => set('minOrder', parseFloat(e.target.value) || 0)}
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </Field>
            <Field label="Max uses (blank = ∞)">
              <input
                type="number"
                min={1}
                value={form.maxUses ?? ''}
                onChange={(e) => set('maxUses', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts at">
              <input
                required
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set('startsAt', e.target.value)}
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </Field>
            <Field label="Expires at">
              <input
                required
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set('expiresAt', e.target.value)}
                className="w-full h-[38px] px-3 border border-[var(--border)] rounded-[var(--radius-xs)] bg-[var(--bg-input)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <MagButton type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </MagButton>
            <MagButton type="submit" variant="primary" className="flex-1" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create coupon'}
            </MagButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────

function CouponRow({ coupon }: { coupon: AdminCouponDto }) {
  const { mutate: del, isPending } = useDeleteCoupon();

  const now = new Date();
  const expired = new Date(coupon.expiresAt) < now;
  const notStarted = new Date(coupon.startsAt) > now;
  const exhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
  const status = !coupon.active || expired || exhausted ? 'inactive' : notStarted ? 'scheduled' : 'active';

  return (
    <div
      className="grid items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface)] transition-colors"
      style={{ gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 60px' }}
    >
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
        <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{coupon.code}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Copied!'); }}
          className="text-[var(--text-tertiary)] hover:text-[var(--accent-text)] transition-colors"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>

      <Pill variant="accent" size="sm">
        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`} off
      </Pill>

      <span className="text-[12px] text-[var(--text-secondary)]">
        {coupon.minOrder > 0 ? `$${coupon.minOrder} min` : 'No min'}
      </span>

      <span className="text-[12px] text-[var(--text-secondary)]">
        {coupon.usedCount} / {coupon.maxUses ?? '∞'}
      </span>

      <span className="text-[12px] text-[var(--text-secondary)]">{formatDate(coupon.expiresAt)}</span>

      <Pill
        size="sm"
        variant={status === 'active' ? 'success' : status === 'scheduled' ? 'warning' : 'danger'}
      >
        {status}
      </Pill>

      <MagButton
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => del(coupon.id)}
        className="text-[var(--danger)]"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </MagButton>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const [filter, setFilter]         = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreate, setShowCreate] = useState(false);

  const { data: coupons = [], isLoading } = useAdminCoupons();

  const now = new Date();
  const withStatus = coupons.map((c) => {
    const expired   = new Date(c.expiresAt) < now;
    const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
    const active    = c.active && !expired && !exhausted;
    return { ...c, _active: active };
  });

  const filtered =
    filter === 'active'   ? withStatus.filter((c) => c._active)  :
    filter === 'inactive' ? withStatus.filter((c) => !c._active) :
    withStatus;

  return (
    <PageLayout>
      {showCreate && <CreateCouponModal onClose={() => setShowCreate(false)} />}

      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Coupon Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {isLoading ? '…' : `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <MagButton variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> New coupon
          </MagButton>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="flex gap-2 mb-5">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-9 px-4 rounded-[var(--radius-xs)] text-[12px] font-medium transition-all capitalize"
              style={
                filter === f
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ background: 'var(--surface)', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 60px' }}
            >
              <span>Code</span>
              <span>Discount</span>
              <span>Min order</span>
              <span>Uses</span>
              <span>Expires</span>
              <span>Status</span>
              <span />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Tag className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)] font-medium">No coupons found</p>
                {filter === 'all' && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-2 text-sm text-[var(--accent-text)] underline underline-offset-2"
                  >
                    Create your first coupon
                  </button>
                )}
              </div>
            ) : (
              filtered.map((c) => <CouponRow key={c.id} coupon={c} />)
            )}
          </div>
        )}
      </Reveal>
    </PageLayout>
  );
}
