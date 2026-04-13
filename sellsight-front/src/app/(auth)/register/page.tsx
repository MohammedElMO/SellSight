'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import type { Role } from '@shared/types';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CUSTOMER' as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authApi.register(form);
      login(data);
      toast.success(`Welcome to SellSight, ${data.firstName}!`);

      switch (data.role) {
        case 'ADMIN': router.push('/admin/dashboard'); break;
        case 'SELLER': router.push('/seller/dashboard'); break;
        default: router.push('/products'); break;
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass-card p-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-[var(--text-secondary)]">Join SellSight today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                First Name
              </label>
              <input
                id="register-first-name"
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="input-field"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                Last Name
              </label>
              <input
                id="register-last-name"
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="input-field"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="input-field pr-12"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              I want to
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CUSTOMER', 'SELLER', 'ADMIN'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update('role', r)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    form.role === r
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg'
                      : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {r === 'CUSTOMER' ? '🛒 Shop' : r === 'SELLER' ? '🏪 Sell' : '⚙️ Admin'}
                </button>
              ))}
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
