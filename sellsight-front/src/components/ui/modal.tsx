'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, type ReactNode } from 'react';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
  hideClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  hideClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: 'fadeInFast 0.15s ease' }}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white rounded-[16px]',
          'shadow-[0_20px_60px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.08)]',
          sizes[size],
          className
        )}
        style={{ animation: 'modalIn 0.2s ease' }}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[#f0efeb]">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-[#111]">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-[#666]">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-[7px] text-[#999] hover:text-[#111] hover:bg-[#f7f6f2] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Confirm dialog ───────────────────────────────────────── */

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive,
  loading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[#666] mb-5">{message}</p>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 px-4 text-sm font-medium text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] rounded-[8px] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'h-9 px-4 text-sm font-medium text-white rounded-[8px] transition-all disabled:opacity-50',
            destructive ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-[#111] hover:bg-[#333]'
          )}
        >
          {loading ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
