'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS, type SortValue } from './product-filters';

interface SearchAndSortBarProps {
  search: string;
  sort: SortValue;
  activeFilterCount: number;
  onSearchChange: (s: string) => void;
  onSortChange: (s: SortValue) => void;
  onOpenFilters: () => void;
}

export function SearchAndSortBar({
  search,
  sort,
  activeFilterCount,
  onSearchChange,
  onSortChange,
  onOpenFilters,
}: SearchAndSortBarProps) {
  return (
    <div
      className="sticky top-2 z-30 mb-6 flex flex-col sm:flex-row items-stretch gap-3 p-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]"
    >
      {/* Search field */}
      <label className="group relative flex-1 flex items-center min-w-0">
        <Search className="absolute left-4 h-4 w-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, brands, categories…"
          className="w-full h-12 pl-11 pr-10 text-[15px] bg-transparent rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:bg-[var(--surface)]/40"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3 h-7 w-7 inline-flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      <div className="flex items-stretch gap-2 shrink-0">
        {/* Sort */}
        <div className="hidden sm:block">
          <Select<SortValue>
            value={sort}
            onChange={onSortChange}
            options={SORT_OPTIONS as unknown as { value: SortValue; label: string }[]}
            size="md"
            align="right"
            triggerClassName="min-w-[180px] h-12"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={onOpenFilters}
          className={cn(
            'h-12 px-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all',
            activeFilterCount > 0
              ? 'bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] shadow-[0_8px_24px_-8px_var(--accent-glow)]'
              : 'bg-[var(--text-primary)] text-white hover:opacity-90',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-white text-[var(--accent)] text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile sort row */}
      <div className="sm:hidden">
        <Select<SortValue>
          value={sort}
          onChange={onSortChange}
          options={SORT_OPTIONS as unknown as { value: SortValue; label: string }[]}
          size="md"
          fullWidth
          triggerClassName="h-12"
        />
      </div>
    </div>
  );
}
