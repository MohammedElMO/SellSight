import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const variants = {
  default: 'bg-[#f7f6f2] text-[#666] border border-[#e5e4e0]',
  dark: 'bg-[#111] text-white',
  success:
    'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]',
  danger:
    'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
  warning:
    'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]',
  info: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
  purple: 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe]',
} as const;

const sizes = {
  sm: 'h-5 px-1.5 text-[10px] rounded-[4px] gap-1',
  md: 'h-[22px] px-2 text-xs rounded-[5px] gap-1',
  lg: 'h-7 px-2.5 text-sm rounded-[6px] gap-1.5',
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium leading-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
