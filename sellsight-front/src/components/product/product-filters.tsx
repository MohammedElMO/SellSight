'use client';

import { Search } from 'lucide-react';
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

interface ProductFiltersProps {
  search: string;
  category: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  totalElements?: number;
  className?: string;
}

export function ProductFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  totalElements,
  className,
}: ProductFiltersProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search + count */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aaa] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products…"
            className={[
              'w-full h-10 pl-10 pr-4 text-sm bg-white',
              'border border-[#e5e4e0] rounded-[9px] text-[#111]',
              'placeholder:text-[#aaa] outline-none transition-all duration-150',
              'focus:border-[#111] focus:ring-2 focus:ring-[#111]/8',
            ].join(' ')}
          />
        </div>
        {totalElements != null && (
          <p className="text-sm text-[#999] shrink-0">
            {totalElements.toLocaleString()} products
          </p>
        )}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {/* All */}
        <button
          onClick={() => onCategoryChange('')}
          className={cn(
            'h-8 px-4 text-sm font-medium rounded-full border whitespace-nowrap transition-all duration-100 shrink-0',
            category === ''
              ? 'bg-[#111] text-white border-[#111]'
              : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999] hover:text-[#111]'
          )}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(category === cat ? '' : cat)}
            className={cn(
              'h-8 px-4 text-sm font-medium rounded-full border whitespace-nowrap transition-all duration-100 shrink-0',
              category === cat
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#666] border-[#e5e4e0] hover:border-[#999] hover:text-[#111]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
