'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  type ProductFilterState,
} from './product-filters';

interface Chip {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  filters: ProductFilterState;
  onChange: (next: Partial<ProductFilterState>) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({ filters, onChange, onClearAll }: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  if (filters.category) {
    chips.push({
      key: 'category',
      label: filters.category,
      onRemove: () => onChange({ category: '' }),
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    const lo = filters.minPrice ? formatPrice(Number(filters.minPrice)) : 'Any';
    const hi = filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : 'Any';
    chips.push({
      key: 'price',
      label: `${lo} – ${hi}`,
      onRemove: () => onChange({ minPrice: '', maxPrice: '' }),
    });
  }
  if (filters.minRating > 0) {
    chips.push({
      key: 'rating',
      icon: <Star className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />,
      label: `${filters.minRating}+ stars`,
      onRemove: () => onChange({ minRating: 0 }),
    });
  }
  if (filters.inStockOnly) {
    chips.push({
      key: 'in-stock',
      label: 'In stock',
      onRemove: () => onChange({ inStockOnly: false }),
    });
  }
  if (filters.sort !== DEFAULT_FILTERS.sort) {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sort);
    if (opt) {
      chips.push({
        key: 'sort',
        label: opt.label,
        onRemove: () => onChange({ sort: 'newest' }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 mb-6">
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.button
            key={c.key}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={c.onRemove}
            className="group inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[12.5px] font-medium text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all"
          >
            {c.icon}
            <span>{c.label}</span>
            <span className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-[var(--surface)] group-hover:bg-[var(--text-primary)] group-hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      <button
        onClick={onClearAll}
        className="ml-1 text-[12.5px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
