'use client';

import { useMemo } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useCategoryTrends } from '@/lib/hooks';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';

function parseTopProducts(topProducts: string) {
  return topProducts
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function CategoryTrendsWidget() {
  const { data, isLoading, isError } = useCategoryTrends();

  const sortedTrends = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => b.trendScore - a.trendScore);
  }, [data]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
            Category trends from Gold layer
          </h2>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            Hive + MapReduce category rollups for admin dashboards
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
          <Sparkles className="h-4 w-4" />
          {sortedTrends.length} categories
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[var(--text-tertiary)]">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={TrendingUp}
          title="Category analytics unavailable"
          description="Run the pipeline so Hive/MapReduce category trends can be displayed here."
        />
      ) : !sortedTrends.length ? (
        <EmptyState
          icon={TrendingUp}
          title="No category trends yet"
          description="Once Gold tables are created, the most active categories will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sortedTrends.slice(0, 4).map((trend, index) => (
            <Reveal key={trend.category} delay={index * 35}>
              <TiltCard intensity={3} className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] p-4 cursor-default">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[14px] text-[var(--text-primary)]">{trend.category}</p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      {trend.totalViews.toLocaleString()} views · {trend.totalCarts.toLocaleString()} carts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-extrabold text-[18px] text-[var(--text-primary)]">
                      {trend.trendScore.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3" /> Trend score
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-[12px]">
                  <div className="rounded-[10px] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[var(--text-tertiary)]">Views</p>
                    <p className="font-semibold text-[var(--text-primary)]">{trend.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[10px] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[var(--text-tertiary)]">Carts</p>
                    <p className="font-semibold text-[var(--text-primary)]">{trend.totalCarts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[10px] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[var(--text-tertiary)]">Avg rating</p>
                    <p className="font-semibold text-[var(--text-primary)]">{trend.avgRating.toFixed(1)}⭐</p>
                  </div>
                  <div className="rounded-[10px] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[var(--text-tertiary)]">Top products</p>
                    <p className="font-semibold text-[var(--text-primary)]">{parseTopProducts(trend.topProducts).length}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {parseTopProducts(trend.topProducts).map((product) => (
                    <span
                      key={product}
                      className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
