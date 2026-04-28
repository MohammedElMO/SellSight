'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProductDto } from '@shared/types';
import { useAuthStore } from '@/store/auth';
import { recentlyViewedApi } from '@/lib/services';

const KEY = 'ss_recently_viewed';
const MAX = 20;

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
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      recentlyViewedApi.getAll().then(setProducts).catch(() => {});
    } else {
      setProducts(loadFromStorage());
    }
  }, [isAuthenticated]);

  const addProduct = useCallback(
    (product: ProductDto) => {
      if (isAuthenticated) {
        // Optimistic local update + fire-and-forget API call
        setProducts((prev) => {
          const filtered = prev.filter((p) => p.id !== product.id);
          return [product, ...filtered].slice(0, MAX);
        });
        recentlyViewedApi.record(product.id).catch(() => {});
      } else {
        setProducts((prev) => {
          const filtered = prev.filter((p) => p.id !== product.id);
          const next = [product, ...filtered].slice(0, MAX);
          saveToStorage(next);
          return next;
        });
      }
    },
    [isAuthenticated],
  );

  const clear = useCallback(() => {
    setProducts([]);
    if (!isAuthenticated) {
      localStorage.removeItem(KEY);
    }
  }, [isAuthenticated]);

  return { products, addProduct, clear };
}
