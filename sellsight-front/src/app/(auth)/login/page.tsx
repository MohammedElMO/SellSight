'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { loginSchema, type LoginFormValues } from '@/lib/schemas';
import { startGoogleOAuth, startSlackOAuth } from '@/lib/oauth';
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
            &ldquo;The best marketplace for quality products and reliable sellers.&rdquo;
          </blockquote>
          <p className="text-white/50 text-sm">&mdash; Happy Customer</p>
        </div>
        <p className="text-white/30 text-xs">&copy; 2026 SellSight</p>
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

          {/* ── OAuth buttons ── */}
          <div className="flex flex-col gap-2.5 mb-6">
            <button
              type="button"
              onClick={startGoogleOAuth}
              className="h-11 flex items-center justify-center gap-2.5 border border-[#e5e4e0] rounded-[9px] text-sm font-medium text-[#111] hover:bg-[#f7f6f2] transition-colors"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={startSlackOAuth}
              className="h-11 flex items-center justify-center gap-2.5 border border-[#e5e4e0] rounded-[9px] text-sm font-medium text-[#111] hover:bg-[#f7f6f2] transition-colors"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312z" fill="#2EB67D"/>
                <path d="M15.165 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.527 2.527 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.522h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z" fill="#ECB22E"/>
              </svg>
              Continue with Slack
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#e5e4e0]" />
            <span className="text-xs text-[#aaa] uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-[#e5e4e0]" />
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
