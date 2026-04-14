import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        circle ? 'rounded-full' : 'rounded-[8px]',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square rounded-[12px]" />
      <div className="flex flex-col gap-2 px-0.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3.5 w-1/3 mt-0.5" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-[#e5e4e0] rounded-[12px] p-5 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-[22px] w-20 rounded-[5px]" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-full rounded-[8px]" />
        <Skeleton className="h-7 w-3/4 rounded-[8px]" />
      </div>
      <div className="flex justify-between pt-3 border-t border-[#f0efeb]">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
