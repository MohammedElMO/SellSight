import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

interface RatingProps {
  value: number;
  max?: number;
  size?: keyof typeof sizes;
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue,
  count,
  className,
}: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(value);
          const half = !filled && i < value;
          return (
            <Star
              key={i}
              className={cn(
                sizes[size],
                filled
                  ? 'fill-[#f5c000] text-[#f5c000]'
                  : half
                  ? 'fill-[#f5c000]/50 text-[#f5c000]'
                  : 'fill-none text-[#e0dfdb]'
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-[#111]">
          {value.toFixed(1)}
        </span>
      )}
      {count != null && (
        <span className="text-sm text-[#999]">({count.toLocaleString()})</span>
      )}
    </div>
  );
}

/* ── Rating bar breakdown ─────────────────────────────────── */

interface RatingBreakdownProps {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}

export function RatingBreakdown({ distribution, total }: RatingBreakdownProps) {
  return (
    <div className="flex flex-col gap-2">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-6 shrink-0">
              <span className="text-sm text-[#666]">{star}</span>
            </div>
            <div className="flex-1 h-2 bg-[#f0efeb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f5c000] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm text-[#999] w-8 text-right shrink-0">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
