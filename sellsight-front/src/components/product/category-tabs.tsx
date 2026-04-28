'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from './product-filters';

interface CategoryTabsProps {
  active: string;
  onChange: (cat: string) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showShadows, setShowShadows] = useState({ left: false, right: true });

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowShadows({
      left:  el.scrollLeft > 8,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    handleScroll();
  }, []);

  const all = ['', ...PRODUCT_CATEGORIES] as const;

  return (
    <div className="relative mb-6">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-12 z-10 transition-opacity',
          'bg-gradient-to-r from-[var(--background)] via-[var(--background)]/70 to-transparent',
          showShadows.left ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-12 z-10 transition-opacity',
          'bg-gradient-to-l from-[var(--background)] via-[var(--background)]/70 to-transparent',
          showShadows.right ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
      >
        <LayoutGroup id="category-tabs">
          {all.map((cat) => {
            const isActive = active === cat;
            const label = cat === '' ? 'All' : cat;
            return (
              <button
                key={cat || 'all'}
                onClick={() => onChange(isActive ? '' : cat)}
                className={cn(
                  'relative shrink-0 snap-start h-10 px-5 inline-flex items-center gap-1.5 rounded-full text-[13.5px] font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-cat-pill"
                    className="absolute inset-0 rounded-full bg-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute inset-0 rounded-full border border-[var(--border)] bg-[var(--bg-card)]" />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  {cat === '' && <Layers className="h-3.5 w-3.5" />}
                  {label}
                </span>
              </button>
            );
          })}
        </LayoutGroup>
      </div>
    </div>
  );
}
