'use client';

import { useMemo } from 'react';
import { ArrowUpRight, BarChart3, Flame, Star } from 'lucide-react';
import { useSellerTopProducts } from '@/lib/hooks';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { TiltCard } from '@/components/ui/tilt-card';
import { Reveal } from '@/components/ui/reveal';

interface SellerTopProductsWidgetProps {
  sellerId: string;
  limit?: number;
}

export function SellerTopProductsWidget({ sellerId, limit = 8 }: SellerTopProductsWidgetProps) {
  const { data, isLoading, isError } = useSellerTopProducts(sellerId, limit);

  const summary = useMemo(() => {
    const products = data ?? [];
    return {
      totalViews: products.reduce((sum, item) => sum + item.views, 0),
      totalCarts: products.reduce((sum, item) => sum + item.addToCart, 0),
      avgScore: products.length
        ? products.reduce((sum, item) => sum + item.popularityScore, 0) / products.length
        : 0,
    };
  }, [data]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
            Big Data seller scores
          </h2>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            From Hive / MapReduce popularity scores
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
          <BarChart3 className="h-4 w-4" />
          {limit} products
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[var(--text-tertiary)]">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Flame}
          title="Pipeline data unavailable"
          description="Start the Big Data pipeline to load seller popularity scores into the dashboard."
        />
      ) : !data?.length ? (
        <EmptyState
          icon={Flame}
          title="No analytics rows yet"
          description="After running Sqoop + Hive + MapReduce, top product scores will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <TiltCard intensity={3} className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Views</p>
              <p className="font-display font-extrabold text-[22px] text-[var(--text-primary)] mt-1">{summary.totalViews.toLocaleString()}</p>
            </TiltCard>
            <TiltCard intensity={3} className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Cart adds</p>
              <p className="font-display font-extrabold text-[22px] text-[var(--text-primary)] mt-1">{summary.totalCarts.toLocaleString()}</p>
            </TiltCard>
            <TiltCard intensity={3} className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Avg score</p>
              <p className="font-display font-extrabold text-[22px] text-[var(--text-primary)] mt-1">{summary.avgScore.toFixed(1)}</p>
            </TiltCard>
          </div>

          <div className="space-y-3">
            {data.map((item, index) => (
              <Reveal key={item.id} delay={index * 30}>
                <div className="flex items-center gap-4 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] px-4 py-3 hover:bg-[var(--surface)] transition-colors">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center bg-[var(--accent-muted)] text-[var(--accent-text)] font-bold">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[14px] text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-[12px] text-[var(--text-tertiary)] truncate">
                      {item.views.toLocaleString()} views · {item.addToCart.toLocaleString()} cart adds · {item.avgRating.toFixed(1)}⭐
                    </p>
                  </div>
                  <div className="text-right flex-none">
                    <p className="font-display font-extrabold text-[18px] text-[var(--text-primary)]">
                      {item.popularityScore.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-end gap-1">
                      <ArrowUpRight className="h-3 w-3" /> Popularity
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-[var(--warning)] flex-none" />
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
