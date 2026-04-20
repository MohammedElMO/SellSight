import { cn } from '@/lib/utils';

interface PillProps {
  children: React.ReactNode;
  variant?: 'accent' | 'gradient' | 'subtle' | 'success' | 'danger' | 'secondary' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
}

export function Pill({ children, variant = 'subtle', size = 'md', className }: PillProps) {
  const base = 'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide leading-none';

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-[11px]',
  };

  const variants = {
    accent:    'bg-[var(--accent-muted)] text-[var(--accent-text)]',
    gradient:  'text-white',
    subtle:    'bg-[var(--surface)] text-[var(--text-secondary)]',
    success:   'bg-[var(--success-muted)] text-[var(--success)]',
    danger:    'bg-[var(--danger-muted)] text-[var(--danger)]',
    secondary: 'bg-[var(--secondary-muted)] text-[var(--secondary-text)]',
    warning:   'bg-[var(--warning-bg)] text-[var(--warning)]',
  };

  return (
    <span
      className={cn(base, sizes[size], variants[variant], className)}
      style={variant === 'gradient' ? { background: 'var(--gradient)' } : undefined}
    >
      {children}
    </span>
  );
}
