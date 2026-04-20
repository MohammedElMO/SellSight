'use client';

import { useProfile, useSellerProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { MagButton } from '@/components/ui/mag-button';
import { AnimCounter } from '@/components/ui/anim-counter';
import { formatPrice } from '@/lib/utils';
import { Package, Plus, TrendingUp, Eye, Tag } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { data: profile } = useProfile();
  const { data: productsPage, isLoading } = useSellerProducts(profile?.id, 0, 20);

  const products      = productsPage?.products ?? [];
  const activeCount   = products.filter((p) => p.active).length;
  const totalValue    = products.reduce((s, p) => s + p.price, 0);
  const categoryCount = new Set(products.map((p) => p.category)).size;

  const stats = [
    { label: 'Total products',  value: products.length,                                              icon: Package,    numeric: true  },
    { label: 'Active listings', value: activeCount,                                                  icon: Eye,        numeric: true  },
    { label: 'Categories',      value: categoryCount,                                                icon: Tag,        numeric: true  },
    { label: 'Avg. price',      value: products.length ? Math.round(totalValue / products.length) : 0, icon: TrendingUp, numeric: false, prefix: '$' },
  ];

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Welcome back{profile ? `, ${profile.firstName}` : ''}
            </p>
          </div>
          <Link href="/seller/products/new">
            <MagButton variant="primary">
              <Plus className="h-4 w-4" />
              New product
            </MagButton>
          </Link>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, numeric, prefix }, i) => (
          <Reveal key={label} delay={i * 60}>
            <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                  <Icon className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
              </div>
              <div className="font-display font-extrabold text-[26px] text-[var(--text-primary)] tracking-[-0.02em]">
                {prefix}{numeric ? <AnimCounter target={value as number} /> : (value as number)}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Recent products */}
      <Reveal delay={280}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-[17px] text-[var(--text-primary)]">Your products</h2>
          <Link href="/seller/products" className="text-[13px] text-[var(--accent-text)] hover:opacity-80 transition-opacity">
            View all →
          </Link>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Reveal delay={320}>
          <div
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[var(--radius-lg)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <Package className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
            <p className="text-[14px] font-semibold text-[var(--text-secondary)] mb-1">No products yet</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-5">Create your first listing to get started</p>
            <Link href="/seller/products/new">
              <MagButton variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Create product
              </MagButton>
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {products.slice(0, 8).map((product, i) => (
            <Reveal key={product.id} delay={320 + i * 40}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
