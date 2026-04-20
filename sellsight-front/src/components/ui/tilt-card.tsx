'use client';

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function TiltCard({
  children,
  intensity = 8,
  className,
  onClick,
  style: extraStyle,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -intensity;
    setTilt({ x, y });
  }, [intensity]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMove}
      style={{
        transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${hover ? 1.02 : 1})`,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s, border-color 0.2s',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        willChange: 'transform',
        ...extraStyle,
      }}
      className={cn(
        'border border-[var(--border)]',
        hover && 'border-[var(--border-hover)]',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
