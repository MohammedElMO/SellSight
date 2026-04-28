'use client';

import { Fragment, ReactNode } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  label?: string;
  error?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  triggerClassName?: string;
  prefix?: ReactNode;
  disabled?: boolean;
  id?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  error,
  placeholder = 'Select…',
  size = 'md',
  align = 'left',
  fullWidth = false,
  className,
  triggerClassName,
  prefix,
  disabled,
  id,
}: SelectProps<T>) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const selected = options.find((o) => o.value === value);

  const heightCls = size === 'sm' ? 'h-10' : 'h-11';
  const textCls = size === 'sm' ? 'text-sm' : 'text-sm';

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className={cn('relative', fullWidth && 'w-full')}>
          <ListboxButton
            id={inputId}
            className={cn(
              'relative flex items-center gap-2 w-full pl-3.5 pr-9 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xs)]',
              'text-left text-[var(--text-primary)] outline-none transition-all duration-150 cursor-pointer',
              'hover:border-[var(--border-hover)] data-[focus]:border-[var(--accent)] data-[focus]:ring-2 data-[focus]:ring-[var(--accent)]/15',
              'data-[open]:border-[var(--accent)] data-[open]:ring-2 data-[open]:ring-[var(--accent)]/15',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--danger)] data-[focus]:border-[var(--danger)] data-[focus]:ring-[var(--danger)]/15',
              heightCls,
              textCls,
              triggerClassName,
            )}
          >
            {prefix && <span className="text-[var(--text-tertiary)] flex items-center shrink-0">{prefix}</span>}
            {selected?.icon && <span className="shrink-0 text-[var(--text-secondary)]">{selected.icon}</span>}
            <span className={cn('truncate flex-1', !selected && 'text-[var(--text-tertiary)]')}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none transition-transform ui-open:rotate-180" />
          </ListboxButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <ListboxOptions
              anchor={{ to: align === 'right' ? 'bottom end' : 'bottom start', gap: 6 }}
              className={cn(
                'z-50 min-w-[var(--button-width)] max-h-[280px] overflow-auto',
                'bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] py-1.5 outline-none',
                '[--anchor-padding:8px]',
              )}
            >
              {options.map((opt) => (
                <ListboxOption key={opt.value} value={opt.value} as={Fragment}>
                  {({ focus, selected: isSelected }) => (
                    <li
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2 mx-1 rounded-[8px] cursor-pointer text-sm transition-colors',
                        focus ? 'bg-[var(--surface)] text-[var(--text-primary)]' : 'text-[var(--text-primary)]',
                        isSelected && 'font-medium',
                      )}
                    >
                      {opt.icon && <span className="shrink-0 text-[var(--text-secondary)]">{opt.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className="truncate leading-tight">{opt.label}</p>
                        {opt.description && (
                          <p className="text-[11px] text-[var(--text-tertiary)] truncate">{opt.description}</p>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />}
                    </li>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
