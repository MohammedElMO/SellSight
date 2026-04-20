'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, Star, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Shoes',
  'Sports',
  'Books',
  'Home',
  'Beauty',
  'Toys',
  'Accessories',
  'Other',
];

export const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest'      },
  { value: 'price_asc',   label: 'Price: Low → High' },
  { value: 'price_desc',  label: 'Price: High → Low' },
  { value: 'rating',      label: 'Top Rated'   },
  { value: 'best_selling',label: 'Best Selling' },
] as const;

export type SortValue = typeof SORT_OPTIONS[number]['value'];

export interface ProductFilterState {
  search:   string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: number;   // 0 = no filter
  sort:     SortValue;
}

export const DEFAULT_FILTERS: ProductFilterState = {
  search:    '',
  category:  '',
  minPrice:  '',
  maxPrice:  '',
  minRating: 0,
  sort:      'newest',
};

interface ProductFiltersProps {
  filters: ProductFilterState;
  onChange: (next: Partial<ProductFilterState>) => void;
  totalElements?: number;
  className?: string;
  /** When true, hides the text search bar (search page has its own) */
  hideSearch?: boolean;
}

export function ProductFilters({
  filters,
  onChange,
  totalElements,
  className,
  hideSearch = false,
}: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating > 0 ? 'r' : '',
    filters.sort !== 'newest' ? 's' : '',
  ].filter(Boolean).length;

  const clearAll = () => onChange(DEFAULT_FILTERS);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Row 1: search + filter toggle + count */}
      <div className="flex items-center gap-3 flex-wrap">
        {!hideSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aaa] pointer-events-none" />
            <input
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Search products…"
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-[#e5e4e0] rounded-[9px] text-[#111] placeholder:text-[#aaa] outline-none transition-all focus:border-[#111] focus:ring-2 focus:ring-[#111]/8"
            />
          </div>
        )}

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortValue })}
            className="h-10 pl-3 pr-8 text-sm bg-white border border-[#e5e4e0] rounded-[9px] text-[#111] outline-none appearance-none cursor-pointer transition-all focus:border-[#111]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#888] pointer-events-none" />
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'h-10 px-4 text-sm font-medium rounded-[9px] border flex items-center gap-2 transition-all',
            showAdvanced || activeFilterCount > 0
              ? 'bg-[#111] text-white border-[#111]'
              : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999] hover:text-[#111]'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-white text-[#111] text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="h-10 px-3 text-sm text-[#888] hover:text-[#111] flex items-center gap-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}

        {totalElements != null && (
          <p className="text-sm text-[#999] ml-auto shrink-0">
            {totalElements.toLocaleString()} product{totalElements !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          onClick={() => onChange({ category: '' })}
          className={cn(
            'h-8 px-4 text-sm font-medium rounded-full border whitespace-nowrap transition-all shrink-0',
            filters.category === ''
              ? 'bg-[#111] text-white border-[#111]'
              : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999] hover:text-[#111]'
          )}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ category: filters.category === cat ? '' : cat })}
            className={cn(
              'h-8 px-4 text-sm font-medium rounded-full border whitespace-nowrap transition-all shrink-0',
              filters.category === cat
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999] hover:text-[#111]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="bg-white border border-[#e5e4e0] rounded-[12px] p-5 flex flex-wrap gap-6">
          {/* Price range */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <p className="text-[12px] font-semibold text-[#111] uppercase tracking-wide">Price Range</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => onChange({ minPrice: e.target.value })}
                  placeholder="Min"
                  className="w-full h-9 pl-7 pr-3 text-sm border border-[#e5e4e0] rounded-[8px] outline-none focus:border-[#111] text-[#111]"
                />
              </div>
              <span className="text-[#aaa] text-sm">–</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ maxPrice: e.target.value })}
                  placeholder="Max"
                  className="w-full h-9 pl-7 pr-3 text-sm border border-[#e5e4e0] rounded-[8px] outline-none focus:border-[#111] text-[#111]"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-semibold text-[#111] uppercase tracking-wide">Min Rating</p>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((n) => {
                const val = n === 0 ? 0 : 6 - n; // 0,5,4,3,2 → display as Any,5★,4★,3★,2★
                const stars = n === 0 ? 0 : 5 - n + 1;
                const label = n === 0 ? 'Any' : `${stars}★+`;
                const rating = n === 0 ? 0 : stars;
                return (
                  <button
                    key={n}
                    onClick={() => onChange({ minRating: filters.minRating === rating ? 0 : rating })}
                    className={cn(
                      'h-8 px-3 text-[12px] font-medium rounded-full border transition-all flex items-center gap-1',
                      filters.minRating === rating && rating > 0
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999]'
                    )}
                  >
                    {n === 0 ? (
                      'Any'
                    ) : (
                      <>
                        <Star className="h-3 w-3 fill-current" /> {stars}+
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
