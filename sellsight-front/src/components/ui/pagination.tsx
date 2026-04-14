'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;           // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const VISIBLE = 5;
  let start = Math.max(0, page - Math.floor(VISIBLE / 2));
  const end = Math.min(totalPages, start + VISIBLE);
  if (end - start < VISIBLE) start = Math.max(0, end - VISIBLE);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  const btnBase =
    'h-9 w-9 flex items-center justify-center rounded-[8px] text-sm font-medium transition-all duration-100';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className={cn(
          btnBase,
          'border border-[#e5e4e0] text-[#666]',
          'hover:border-[#111] hover:text-[#111] hover:bg-[#f7f6f2]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e5e4e0] disabled:hover:text-[#666] disabled:hover:bg-transparent'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className={cn(btnBase, 'border border-[#e5e4e0] text-[#666] hover:border-[#111] hover:text-[#111] hover:bg-[#f7f6f2]')}
          >
            1
          </button>
          {start > 1 && (
            <span className="h-9 w-6 flex items-end justify-center pb-1 text-[#999] text-sm">
              …
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            btnBase,
            p === page
              ? 'bg-[#111] text-white'
              : 'border border-[#e5e4e0] text-[#666] hover:border-[#111] hover:text-[#111] hover:bg-[#f7f6f2]'
          )}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="h-9 w-6 flex items-end justify-center pb-1 text-[#999] text-sm">
              …
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className={cn(btnBase, 'border border-[#e5e4e0] text-[#666] hover:border-[#111] hover:text-[#111] hover:bg-[#f7f6f2]')}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={cn(
          btnBase,
          'border border-[#e5e4e0] text-[#666]',
          'hover:border-[#111] hover:text-[#111] hover:bg-[#f7f6f2]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e5e4e0] disabled:hover:text-[#666] disabled:hover:bg-transparent'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
