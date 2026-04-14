'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, ShoppingBag, Store, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@shared/types';

const ROLES: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: 'CUSTOMER', label: 'Customer', icon: ShoppingBag },
  { value: 'SELLER',   label: 'Seller',   icon: Store       },
  { value: 'ADMIN',    label: 'Admin',    icon: Shield      },
];

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const login  = useAuthStore((s) => s.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const data = await authApi.register(values);
      login(data);
      toast.success(`Welcome, ${data.firstName}!`);
      if (data.role === 'ADMIN')       router.push('/admin/orders');
      else if (data.role === 'SELLER') router.push('/seller/dashboard');
      else                             router.push('/products');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#111] px-12 py-14">
        <Link href="/" className="font-bold text-[22px] text-white">
          SellSight
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Join thousands of buyers &amp; sellers
          </h2>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Create your account in under a minute and start exploring the marketplace.
          </p>
        </div>
        <p className="text-white/30 text-xs">© 2026 SellSight</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="lg:hidden block font-bold text-[20px] text-[#111] mb-10">
            SellSight
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#111] mb-1.5">Create account</h1>
            <p className="text-sm text-[#666]">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-[13px] font-medium text-[#111]">First name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register('firstName')}
                  className={cn(
                    'h-11 px-3.5 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                    errors.firstName ? 'border-[#dc2626] focus:border-[#dc2626]' : 'border-[#e5e4e0] focus:border-[#111]'
                  )}
                />
                {errors.firstName && <p className="text-xs text-[#dc2626]">{errors.firstName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-[13px] font-medium text-[#111]">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register('lastName')}
                  className={cn(
                    'h-11 px-3.5 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                    errors.lastName ? 'border-[#dc2626] focus:border-[#dc2626]' : 'border-[#e5e4e0] focus:border-[#111]'
                  )}
                />
                {errors.lastName && <p className="text-xs text-[#dc2626]">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[#111]">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={cn(
                  'h-11 px-3.5 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                  'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                  errors.email ? 'border-[#dc2626] focus:border-[#dc2626]' : 'border-[#e5e4e0] focus:border-[#111]'
                )}
              />
              {errors.email && <p className="text-xs text-[#dc2626]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-[#111]">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  {...register('password')}
                  className={cn(
                    'w-full h-11 pl-3.5 pr-11 text-sm bg-white border rounded-[9px] text-[#111] placeholder:text-[#aaa]',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-[#111]/8',
                    errors.password ? 'border-[#dc2626] focus:border-[#dc2626]' : 'border-[#e5e4e0] focus:border-[#111]'
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

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-[#111]">Account type</span>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-[9px] border text-center transition-all duration-100',
                      selectedRole === value
                        ? 'border-[#111] bg-[#111] text-white'
                        : 'border-[#e5e4e0] text-[#666] hover:border-[#999] hover:text-[#111] hover:bg-[#f7f6f2]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-11 flex items-center justify-center gap-2 bg-[#111] text-white text-sm font-semibold rounded-[9px] hover:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: 'spin 0.65s linear infinite' }}
                />
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#666]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#111] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
