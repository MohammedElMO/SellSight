'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'c1', name: 'Electronics',  products: 4821, active: true,  icon: '🔌' },
  { id: 'c2', name: 'Fashion',      products: 6240, active: true,  icon: '👗' },
  { id: 'c3', name: 'Home',         products: 3180, active: true,  icon: '🏠' },
  { id: 'c4', name: 'Sports',       products: 2840, active: true,  icon: '⚽' },
  { id: 'c5', name: 'Beauty',       products: 1920, active: true,  icon: '✨' },
  { id: 'c6', name: 'Books',        products: 5410, active: true,  icon: '📚' },
  { id: 'c7', name: 'Toys',         products: 980,  active: false, icon: '🧸' },
  { id: 'c8', name: 'Accessories',  products: 2140, active: true,  icon: '👜' },
  { id: 'c9', name: 'Other',        products: 640,  active: true,  icon: '📦' },
];

export default function AdminCategoriesPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Category Management</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{CATEGORIES.length} categories · {CATEGORIES.reduce((s, c) => s + c.products, 0).toLocaleString()} total products</p>
          </div>
          <MagButton variant="primary" onClick={() => toast.info('Add category dialog would open')}>
            <Plus className="h-4 w-4" /> Add category
          </MagButton>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 50}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-center gap-4 hover:border-[var(--border-hover)] transition-colors group">
              <div
                className="w-12 h-12 rounded-[var(--radius)] flex items-center justify-center text-2xl flex-none"
                style={{ background: 'var(--surface)' }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[14px] text-[var(--text-primary)]">{cat.name}</p>
                  {!cat.active && <Pill size="sm" variant="subtle">hidden</Pill>}
                </div>
                <p className="text-[12px] text-[var(--text-secondary)]">{cat.products.toLocaleString()} products</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toast.info(`Edit ${cat.name}`)}
                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] hover:bg-[var(--accent-muted)] text-[var(--text-tertiary)] hover:text-[var(--accent-text)] transition-colors">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toast.error(`${cat.name} deleted`)}
                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] hover:bg-[var(--danger-muted)] text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageLayout>
  );
}
