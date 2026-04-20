'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProductDto } from '@shared/types';

const KEY = 'ss_recently_viewed';
const MAX = 10;

function loadFromStorage(): ProductDto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProductDto[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(products: ProductDto[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(products));
  } catch {}
}

export function useRecentlyViewed() {
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    setProducts(loadFromStorage());
  }, []);

  const addProduct = useCallback((product: ProductDto) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setProducts([]);
  }, []);

  return { products, addProduct, clear };
}
