'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Switch, Field, Label } from '@headlessui/react';
import { Fragment } from 'react';
import { Star, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import {
  PRICE_BOUNDS,
  countActiveFilters,
  type ProductFilterState,
} from './product-filters';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilterState;
  onChange: (next: Partial<ProductFilterState>) => void;
  onClearAll: () => void;
}

const RATING_OPTIONS = [
  { value: 4, label: '4★ & up' },
  { value: 3, label: '3★ & up' },
  { value: 2, label: '2★ & up' },
] as const;

export function FilterDrawer({ open, onClose, filters, onChange, onClearAll }: FilterDrawerProps) {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : PRICE_BOUNDS.min;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : PRICE_BOUNDS.max;
  const activeCount = countActiveFilters(filters);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="w-full sm:max-w-md h-full bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
                <div>
                  <DialogTitle className="font-display font-bold text-[20px] text-[var(--text-primary)] tracking-[-0.02em]">
                    Refine
                  </DialogTitle>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                    {activeCount > 0 ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied` : 'No filters applied'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close filters"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
                {/* Price range */}
                <FilterGroup title="Price range" hint={`${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}>
                  <div className="space-y-4">
                    <PriceRange
                      min={minPrice}
                      max={maxPrice}
                      onChange={(lo, hi) =>
                        onChange({
                          minPrice: lo > PRICE_BOUNDS.min ? String(lo) : '',
                          maxPrice: hi < PRICE_BOUNDS.max ? String(hi) : '',
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <PriceField
                        label="Min"
                        value={filters.minPrice}
                        onChange={(v) => onChange({ minPrice: v })}
                      />
                      <PriceField
                        label="Max"
                        value={filters.maxPrice}
                        onChange={(v) => onChange({ maxPrice: v })}
                      />
                    </div>
                  </div>
                </FilterGroup>

                {/* Rating */}
                <FilterGroup title="Customer rating">
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTIONS.map(({ value, label }) => {
                      const active = filters.minRating === value;
                      return (
                        <button
                          key={value}
                          onClick={() => onChange({ minRating: active ? 0 : value })}
                          className={cn(
                            'inline-flex items-center gap-1 h-10 px-4 rounded-full text-[13px] font-medium border transition-all',
                            active
                              ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]',
                          )}
                        >
                          <Star
                            className={cn(
                              'h-3.5 w-3.5',
                              active ? 'fill-white text-white' : 'fill-[#fbbf24] text-[#fbbf24]',
                            )}
                          />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </FilterGroup>

                {/* In stock toggle */}
                <FilterGroup title="Availability">
                  <Field className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <div>
                      <Label className="text-[14px] font-medium text-[var(--text-primary)] cursor-pointer">
                        In-stock only
                      </Label>
                      <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                        Hide products that are sold out
                      </p>
                    </div>
                    <Switch
                      checked={filters.inStockOnly}
                      onChange={(v) => onChange({ inStockOnly: v })}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                        filters.inStockOnly ? 'bg-[var(--accent)]' : 'bg-[var(--border)]',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                          filters.inStockOnly ? 'translate-x-5' : 'translate-x-0.5',
                        )}
                      />
                    </Switch>
                  </Field>
                </FilterGroup>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 flex items-center gap-3">
                <button
                  onClick={() => {
                    onClearAll();
                  }}
                  disabled={activeCount === 0}
                  className="h-11 px-5 text-[13px] font-medium rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:hover:text-[var(--text-secondary)] transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--text-primary)] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                >
                  <Check className="h-4 w-4" />
                  Show results
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

function FilterGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {title}
        </h3>
        {hint && <span className="text-[12px] font-medium text-[var(--text-secondary)]">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function PriceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-[13px]">$</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full h-11 pl-16 pr-3 text-[14px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      />
    </div>
  );
}

/* ── Dual-thumb price slider ─────────────────────────────────── */
function PriceRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (lo: number, hi: number) => void;
}) {
  const lower = Math.max(PRICE_BOUNDS.min, Math.min(min, max));
  const upper = Math.min(PRICE_BOUNDS.max, Math.max(max, min));
  const range = PRICE_BOUNDS.max - PRICE_BOUNDS.min;
  const leftPct  = ((lower - PRICE_BOUNDS.min) / range) * 100;
  const rightPct = 100 - ((upper - PRICE_BOUNDS.min) / range) * 100;

  return (
    <div className="relative h-8 flex items-center">
      <div className="relative w-full h-1.5 rounded-full bg-[var(--surface-hover)]">
        <div
          className="absolute h-full rounded-full bg-[var(--accent)]"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
      </div>
      <input
        type="range"
        min={PRICE_BOUNDS.min}
        max={PRICE_BOUNDS.max}
        step={5}
        value={lower}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), upper - 5);
          onChange(v, upper);
        }}
        className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
      />
      <input
        type="range"
        min={PRICE_BOUNDS.min}
        max={PRICE_BOUNDS.max}
        step={5}
        value={upper}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), lower + 5);
          onChange(lower, v);
        }}
        className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
      />
    </div>
  );
}
