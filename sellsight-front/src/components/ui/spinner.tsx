import { cn } from '@/lib/utils';

const sizes = {
  xs: 'h-3.5 w-3.5 border-[1.5px]',
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
} as const;

interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-[#e5e4e0] border-t-[#111]',
        sizes[size],
        className
      )}
      style={{ animation: 'spin 0.65s linear infinite' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
