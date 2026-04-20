'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = { sm: 14, md: 18, lg: 22 };

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              'transition-colors duration-100',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              size={s}
              className={cn(
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-gray-300',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
