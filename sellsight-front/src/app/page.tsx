'use client';

import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Star, Package, Users, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Package,
    title: 'Thousands of products',
    desc: 'Browse a curated catalogue of quality items across all categories.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & trusted',
    desc: 'JWT-protected accounts and role-based access for every user.',
  },
  {
    icon: Users,
    title: 'Seller storefronts',
    desc: 'Create your own store, list products, and reach thousands of buyers.',
  },
  {
    icon: BarChart3,
    title: 'Real-time order tracking',
    desc: 'Follow every order from placement to delivery with live status updates.',
  },
];

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: '/products',
  SELLER:   '/seller/dashboard',
  ADMIN:    '/admin/orders',
};

export default function HomePage() {
  const { isAuthenticated, role, firstName } = useAuthStore();
  const dashboardHref = role ? ROLE_HOME[role] : '/';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Minimal landing navbar ── */}
      <header className="sticky top-0 z-40 bg-white/96 backdrop-blur-md border-b border-[#e5e4e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-[20px] tracking-tight text-[#111]">
            SellSight
          </span>
          <nav className="flex items-center gap-2">
            <Link
              href="/products"
              className="hidden sm:flex h-9 px-3.5 items-center text-sm font-medium text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] rounded-[8px] transition-all"
            >
              Shop
            </Link>
            {isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="h-9 px-5 flex items-center text-sm font-semibold bg-[#111] text-white rounded-[9px] hover:bg-[#2a2a2a] transition-all"
              >
                {firstName ? `Hi, ${firstName}` : 'Go to dashboard'}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-4 flex items-center text-sm font-medium text-[#666] hover:text-[#111] hover:bg-[#f7f6f2] rounded-[8px] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-5 flex items-center text-sm font-semibold bg-[#111] text-white rounded-[9px] hover:bg-[#2a2a2a] transition-all"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center animate-fade-in">
        <div className="inline-flex items-center gap-1.5 bg-[#f7f6f2] border border-[#e5e4e0] rounded-full px-4 py-1.5 text-sm text-[#666] mb-8">
          <Star className="h-3.5 w-3.5 fill-[#f5c000] text-[#f5c000] shrink-0" />
          Trusted by 10,000+ buyers &amp; sellers
        </div>

        <h1 className="text-5xl sm:text-[72px] font-bold text-[#111] leading-[1.04] tracking-tight mb-6 max-w-3xl">
          Discover products worth buying
        </h1>

        <p className="text-lg sm:text-xl text-[#666] max-w-xl leading-relaxed mb-10">
          A clean, modern marketplace that connects quality sellers with
          discerning buyers — built on solid DDD and hexagonal architecture.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/products"
            className="h-12 px-7 flex items-center gap-2 text-[15px] font-semibold bg-[#111] text-white rounded-[11px] hover:bg-[#2a2a2a] transition-all"
          >
            Browse products
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="h-12 px-7 flex items-center text-[15px] font-semibold text-[#111] bg-white border border-[#e5e4e0] rounded-[11px] hover:border-[#111] hover:bg-[#f7f6f2] transition-all"
            >
              Start selling
            </Link>
          )}
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-t border-[#e5e4e0] bg-[#f7f6f2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck,        title: 'Fast delivery',   desc: 'Free shipping on orders over $30' },
            { icon: ShieldCheck,  title: 'Secure payments', desc: 'Your data is always protected'     },
            { icon: RefreshCcw,   title: 'Easy returns',    desc: '30-day hassle-free return policy'  },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-[10px] bg-white border border-[#e5e4e0] flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#111]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111]">{title}</p>
                <p className="text-sm text-[#666]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111] mb-3">
            Everything you need
          </h2>
          <p className="text-[#666] text-lg max-w-lg mx-auto">
            Powerful tools for buyers, sellers, and administrators.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 border border-[#e5e4e0] rounded-[14px] hover:border-[#ccc9c2] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-[10px] bg-[#f7f6f2] flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-[#111]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#111] mb-1.5">{title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="mx-4 sm:mx-6 mb-20 rounded-[20px] bg-[#111] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 sm:px-16 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to get started?</h2>
            <p className="text-white/70 text-[15px]">
              Join thousands of buyers and sellers on SellSight today.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="h-11 px-6 flex items-center text-sm font-semibold bg-white text-[#111] rounded-[9px] hover:bg-[#f0efeb] transition-all"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="h-11 px-6 flex items-center text-sm font-semibold bg-white text-[#111] rounded-[9px] hover:bg-[#f0efeb] transition-all"
                >
                  Create account
                </Link>
                <Link
                  href="/products"
                  className="h-11 px-6 flex items-center text-sm font-semibold bg-white/10 text-white border border-white/20 rounded-[9px] hover:bg-white/20 transition-all"
                >
                  Browse products
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
