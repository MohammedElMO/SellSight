'use client';

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MagButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function MagButton({
  children,
  onClick,
  variant = 'ghost',
  size = 'md',
  className,
  disabled,
  type = 'button',
  style: extraStyle,
  'aria-label': ariaLabel,
}: MagButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setOffset({ x, y });
  }, [disabled]);

  const sizes = {
    sm: 'h-9 px-4 text-xs gap-1.5 rounded-[var(--radius-xs)]',
    md: 'h-[46px] px-6 text-sm gap-2 rounded-[var(--radius-sm)]',
    lg: 'h-14 px-8 text-base gap-2.5 rounded-[var(--radius-sm)]',
  };

  const variants = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-transparent',
    secondary: 'bg-[var(--bg-card)] hover:bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border)]',
    ghost: 'bg-transparent hover:bg-[var(--accent-muted)] text-[var(--text-primary)] border-[var(--border)]',
    danger: 'bg-[var(--danger)] hover:opacity-90 text-white border-transparent',
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setOffset({ x: 0, y: 0 }); }}
      onMouseMove={handleMove}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${hover ? 1.02 : 1})`,
        transition: 'background-color 0.2s, transform 0.15s ease-out, box-shadow 0.2s, opacity 0.2s',
        boxShadow: hover && variant === 'primary' ? '0 8px 32px var(--accent-glow)' : undefined,
        ...extraStyle,
      }}
      className={cn(
        'inline-flex items-center justify-center font-semibold border',
        'cursor-pointer whitespace-nowrap select-none',
        sizes[size],
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {children}
    </button>
  );
}
