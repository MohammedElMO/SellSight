'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const variants = {
  primary:
    'bg-[#111] text-white hover:bg-[#2a2a2a] active:bg-[#000] shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
  secondary:
    'bg-[#f7f6f2] text-[#111] hover:bg-[#efede7] border border-[#e5e4e0] hover:border-[#ccc9c2]',
  ghost: 'bg-transparent text-[#111] hover:bg-[#f7f6f2]',
  outline:
    'bg-transparent text-[#111] border border-[#e5e4e0] hover:border-[#111] hover:bg-[#f7f6f2]',
  danger:
    'bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
  success:
    'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
} as const;

const sizes = {
  xs: 'h-7 px-2.5 text-xs rounded-[6px]',
  sm: 'h-8 px-3 text-sm rounded-[7px]',
  md: 'h-10 px-4 text-sm rounded-[9px]',
  lg: 'h-11 px-5 text-[15px] rounded-[10px]',
  xl: 'h-13 px-7 text-base rounded-[11px]',
  icon: 'h-9 w-9 rounded-[8px] shrink-0',
  'icon-sm': 'h-8 w-8 rounded-[7px] shrink-0',
  'icon-lg': 'h-10 w-10 rounded-[9px] shrink-0',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
