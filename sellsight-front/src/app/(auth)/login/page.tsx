'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { loginSchema, type LoginFormValues } from '@/lib/schemas';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const login  = useAuthStore((s) => s.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await authApi.login(values);
      login(data);
      toast.success(`Welcome back, ${data.firstName}!`);
      if (data.role === 'ADMIN')       router.push('/admin/orders');
      else if (data.role === 'SELLER') router.push('/seller/dashboard');
      else                             router.push('/products');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid email or password';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#111] px-12 py-14">
        <Link href="/" className="font-bold text-[22px] text-white">
          SellSight
        </Link>
        <div>
          <blockquote className="text-xl font-medium text-white leading-relaxed mb-4">
            "The best marketplace for quality products and reliable sellers."
          </blockquote>
          <p className="text-white/50 text-sm">— Happy Customer</p>
        </div>
        <p className="text-white/30 text-xs">© 2026 SellSight</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="lg:hidden block font-bold text-[20px] text-[#111] mb-10">
            SellSight
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111] mb-1.5">Sign in</h1>
            <p className="text-sm text-[#666]">Welcome back — enter your credentials below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[#111]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={cn(
                  'h-11 px-3.5 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                  'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                  errors.email
                    ? 'border-[#dc2626] focus:border-[#dc2626]'
                    : 'border-[#e5e4e0] focus:border-[#111]'
                )}
              />
              {errors.email && <p className="text-xs text-[#dc2626]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-[#111]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn(
                    'w-full h-11 pl-3.5 pr-11 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                    errors.password
                      ? 'border-[#dc2626] focus:border-[#dc2626]'
                      : 'border-[#e5e4e0] focus:border-[#111]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#dc2626]">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 flex items-center justify-center gap-2 bg-[#111] text-white text-sm font-semibold rounded-[9px] hover:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: 'spin 0.65s linear infinite' }}
                />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#666]">
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-[#111] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
