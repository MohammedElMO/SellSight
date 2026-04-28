'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductSearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['autocomplete', debouncedQuery],
    queryFn: () => productApi.autocomplete(debouncedQuery, 8),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative">
        <label htmlFor="search" className="sr-only">Search products</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <input
            id="search"
            className="block w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-full leading-5 bg-[var(--bg-secondary)] placeholder-[var(--text-secondary)] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:text-sm transition-colors"
            placeholder="Search products..."
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
          />
          {isFetching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 text-[var(--accent)] animate-spin" />
            </div>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden"
          >
            {isFetching ? (
              <div className="p-4 text-sm text-[var(--text-secondary)] text-center flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <ul className="max-h-96 overflow-y-auto">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--bg-secondary)] rounded flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] truncate">
                            {item.category} &bull; {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleSearch}
                    className="w-full text-left px-4 py-3 text-sm text-[var(--accent)] hover:bg-[var(--bg-card-hover)] font-medium border-t border-[var(--border)]"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </li>
              </ul>
            ) : (
              <div className="p-4 text-sm text-[var(--text-secondary)]">
                No matching products found. Try a different search term.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
