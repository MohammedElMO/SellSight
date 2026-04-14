import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center px-4',
        className
      )}
    >
      {Icon && (
        <div className="mb-5 h-16 w-16 flex items-center justify-center rounded-[14px] bg-[#f7f6f2] border border-[#e5e4e0]">
          <Icon className="h-8 w-8 text-[#bbb]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#111] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-[#666] max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
