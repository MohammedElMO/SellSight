'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#111]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-[#999] pointer-events-none flex items-center">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 px-3.5 text-sm bg-white border border-[#e5e4e0] rounded-[9px] text-[#111]',
              'placeholder:text-[#aaa] outline-none transition-all duration-150',
              'focus:border-[#111] focus:ring-2 focus:ring-[#111]/8',
              error &&
                'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/10',
              prefix && 'pl-10',
              suffix && 'pr-10',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[#999] flex items-center">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#999]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ── Textarea ─────────────────────────────────────────────── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#111]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-3 text-sm bg-white border border-[#e5e4e0] rounded-[9px] text-[#111]',
            'placeholder:text-[#aaa] outline-none transition-all duration-150 resize-none',
            'focus:border-[#111] focus:ring-2 focus:ring-[#111]/8',
            error &&
              'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#999]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/* ── Select ───────────────────────────────────────────────── */

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#111]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-11 px-3.5 text-sm bg-white border border-[#e5e4e0] rounded-[9px] text-[#111]',
            'outline-none transition-all duration-150 cursor-pointer appearance-none',
            'focus:border-[#111] focus:ring-2 focus:ring-[#111]/8',
            error &&
              'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/10',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
