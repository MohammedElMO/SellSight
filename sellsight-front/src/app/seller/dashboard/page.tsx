'use client';

import { useProfile, useSellerProducts } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
    { label: 'Total products', value: products.length,   icon: Package    },
    { label: 'Active listings', value: activeCount,      icon: Eye        },
    { label: 'Categories',      value: categoryCount,    icon: Tag        },
    {
      label: 'Avg. price',
      value: products.length ? formatPrice(totalValue / products.length) : '$0',
      icon: TrendingUp,
    },
  ];

  return (
    <PageLayout>
      <div className="flex items-start justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-[28px] font-bold text-[#111]">Dashboard</h1>
          <p className="text-[#666] text-sm mt-1">
            Welcome back{profile ? `, ${profile.firstName}` : ''}
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button size="md">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="p-5 border border-[#e5e4e0] rounded-[14px] bg-white hover:border-[#ccc9c2] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#999] uppercase tracking-wider">{label}</span>
              <div className="h-8 w-8 rounded-[8px] bg-[#f7f6f2] flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#666]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111]">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent products */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-[#111]">Your products</h2>
        <Link
          href="/seller/products"
          className="text-sm text-[#666] hover:text-[#111] transition-colors"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#e5e4e0] rounded-[16px]">
          <Package className="h-10 w-10 text-[#ccc] mb-3" />
          <p className="text-sm font-medium text-[#666] mb-1">No products yet</p>
          <p className="text-sm text-[#999] mb-5">Create your first listing to get started</p>
          <Link href="/seller/products/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Create product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 animate-fade-in">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
