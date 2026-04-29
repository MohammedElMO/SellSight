'use client';

import { useMyInsights } from '@/lib/hooks';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';

export function UserInsightsWidget() {
  const { data, isLoading, isError } = useMyInsights();

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
            Your shopping insights
          </h2>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            Derived from the Gold user features table
          </p>
        </div>
        <div className="h-8 w-8 rounded-[12px] flex items-center justify-center bg-[var(--accent-muted)] text-[var(--accent-text)] text-[11px] font-bold">
          BD
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[var(--text-tertiary)]">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          title="User insights unavailable"
          description="Run the Big Data pipeline to compute user features and shopping patterns."
        />
      ) : !data ? (
        <EmptyState
          title="No insights available"
          description="After the pipeline writes the Gold user features table, your insights will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Products viewed', value: data.productsViewed },
            { label: 'Products carted', value: data.productsCarted },
            { label: 'Products purchased', value: data.productsPurchased },
            { label: 'Avg rating given', value: data.avgRatingGiven.toFixed(1) },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 30}>
              <TiltCard intensity={2} className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] p-4 cursor-default">
                <p className="text-[12px] text-[var(--text-tertiary)] font-medium mb-2">{item.label}</p>
                <p className="font-display font-extrabold text-[22px] text-[var(--text-primary)]">{item.value}</p>
              </TiltCard>
            </Reveal>
          ))}

          <div className="sm:col-span-2 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
            <p className="text-[12px] text-[var(--text-tertiary)] mb-1">Preferred category</p>
            <p className="font-semibold text-[var(--text-primary)]">{data.preferredCategory}</p>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-2">
              User ID: {data.userId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
