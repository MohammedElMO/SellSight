'use client';

import { Sparkles } from 'lucide-react';

interface ShopHeaderProps {
  totalElements?: number;
  isSearching?: boolean;
}

export function ShopHeader({ totalElements, isSearching }: ShopHeaderProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-xl)] mb-8 px-6 sm:px-10 py-10 sm:py-14"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--accent-glow)' }}
      />
      <div className="relative flex flex-col gap-3 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--bg-card)]/70 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-text)] border border-[var(--border-subtle)]">
          <Sparkles className="h-3 w-3" />
          {isSearching ? 'Smart search' : 'Curated catalog'}
        </span>
        <h1 className="font-display font-extrabold text-[40px] sm:text-[52px] leading-[1.04] tracking-[-0.035em] text-[var(--text-primary)]">
          Shop the everything store.
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] max-w-lg">
          Discover thoughtfully sourced products from trusted sellers — filter by price, rating, and availability to find exactly what you need.
        </p>
        {totalElements != null && (
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            <span className="font-semibold text-[var(--text-secondary)]">{totalElements.toLocaleString()}</span>
            {' '}products available
          </p>
        )}
      </div>
    </section>
  );
}
