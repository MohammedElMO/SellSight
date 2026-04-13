'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Users, Package, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, role, firstName } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role) {
        case 'ADMIN': router.push('/admin/dashboard'); break;
        case 'SELLER': router.push('/seller/dashboard'); break;
        case 'CUSTOMER': router.push('/products'); break;
      }
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center animate-fade-in max-w-3xl">
        <h1 className="text-6xl font-extrabold mb-4">
          <span className="gradient-text">SellSight</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed">
          Your premium e-commerce platform. Browse products, manage your store,
          or oversee the entire marketplace.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/login" className="btn-primary text-lg px-8 py-4 no-underline">
            Sign In
          </Link>
          <Link href="/register" className="btn-outline text-lg px-8 py-4 no-underline">
            Create Account
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full animate-slide-up"
           style={{ animationDelay: '0.2s' }}>
        {[
          { icon: ShoppingBag, title: 'Browse & Shop', desc: 'Discover products from top sellers', color: '#6c5ce7' },
          { icon: Package, title: 'Manage Products', desc: 'Full CRUD for your product catalog', color: '#00cec9' },
          { icon: Users, title: 'Role-Based Access', desc: 'Admin, Seller & Customer dashboards', color: '#fdcb6e' },
          { icon: BarChart3, title: 'Track Orders', desc: 'Real-time order status tracking', color: '#ff6b6b' },
        ].map((feature, i) => (
          <div key={i} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <feature.icon size={40} className="mx-auto mb-4" style={{ color: feature.color }} />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
