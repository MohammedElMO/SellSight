'use client';

/**
 * Filter state, constants, and option lists shared across the shop.
 * The legacy combined ProductFilters panel was replaced by a set of
 * smaller pieces in components/product/* (CategoryTabs, FilterDrawer,
 * SearchAndSortBar, ActiveFilterChips).
 */

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
] as const;

export const SORT_OPTIONS = [
  { value: 'newest',       label: 'Newest first'      },
  { value: 'price_asc',    label: 'Price: Low → High' },
  { value: 'price_desc',   label: 'Price: High → Low' },
  { value: 'rating',       label: 'Top rated'         },
  { value: 'best_selling', label: 'Best selling'      },
] as const;

export type SortValue = typeof SORT_OPTIONS[number]['value'];

export interface ProductFilterState {
  search:       string;
  category:     string;
  minPrice:     string;
  maxPrice:     string;
  minRating:    number;
  inStockOnly:  boolean;
  sort:         SortValue;
}

export const DEFAULT_FILTERS: ProductFilterState = {
  search:       '',
  category:     '',
  minPrice:     '',
  maxPrice:     '',
  minRating:    0,
  inStockOnly:  false,
  sort:         'newest',
};

export const PRICE_BOUNDS = { min: 0, max: 1000 } as const;

export function countActiveFilters(f: ProductFilterState): number {
  let n = 0;
  if (f.category)            n++;
  if (f.minPrice)            n++;
  if (f.maxPrice)            n++;
  if (f.minRating > 0)       n++;
  if (f.inStockOnly)         n++;
  if (f.sort !== 'newest')   n++;
  return n;
}
