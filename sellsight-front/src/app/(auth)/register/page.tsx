'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas';
import { startGoogleOAuth, startSlackOAuth } from '@/lib/oauth';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@shared/types';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';

const ROLES: { value: Role; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'CUSTOMER', label: 'Customer', icon: ShoppingBag, desc: 'Shop & discover' },
  { value: 'SELLER',   label: 'Seller',   icon: Store,       desc: 'List & sell'     },
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
      if (!data.emailVerified) {
        toast.success('Account created! Check your inbox to verify your email.');
        router.push(`/pending-verification?email=${encodeURIComponent(data.email)}`);
      } else if (data.role === 'SELLER' && data.sellerStatus === 'PENDING') {
        toast.success(`Welcome, ${data.firstName}! Your seller application is under review.`);
        router.push('/seller/pending-approval');
      } else {
        toast.success(`Welcome, ${data.firstName}!`);
        if (data.role === 'ADMIN')       router.push('/admin/dashboard');
        else if (data.role === 'SELLER') router.push('/seller/dashboard');
        else                             router.push('/products');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between px-11 py-10 relative overflow-hidden"
        style={{ background: 'var(--gradient)' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-[30%] right-[-15%] w-[350px] h-[350px] rounded-full border border-white/8" />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-white/20 flex items-center justify-center">
            <Eye className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-extrabold text-xl text-white">SellSight</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-3xl text-white leading-[1.15] mb-4">
            Start your journey<br />with SellSight.
          </h2>
          <p className="text-sm text-white/65 leading-relaxed">
            Whether you're buying or selling — our marketplace has you covered.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/35">© 2026 SellSight</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-[var(--bg-card)] overflow-y-auto">
        <div className="w-full max-w-[400px]">

          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div
              className="w-7 h-7 rounded-[7px] flex items-center justify-center"
              style={{ background: 'var(--gradient)' }}
            >
              <Eye className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl text-[var(--text-primary)]">SellSight</span>
          </Link>

          <Reveal>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] mb-1.5 tracking-[-0.02em]">
              Create account
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-7">Choose your role and get started</p>
          </Reveal>

          {/* Role picker */}
          <Reveal delay={60}>
            <div className="flex gap-3 mb-6">
              {ROLES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('role', value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 py-4 px-2 rounded-[var(--radius)] border-2 text-center transition-all duration-150',
                    selectedRole === value
                      ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]',
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-[var(--radius-xs)] flex items-center justify-center transition-all',
                      selectedRole === value
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface)] text-[var(--text-secondary)]',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">{desc}</span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* OAuth */}
          <Reveal delay={120}>
            <div className="flex flex-col gap-2.5 mb-5">
              <button type="button" onClick={startGoogleOAuth}
                className="h-11 flex items-center justify-center gap-2.5 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </Reveal>

          <Reveal delay={190}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-[13px] font-semibold text-[var(--text-primary)]">First name</label>
                  <input id="firstName" type="text" placeholder="John" {...register('firstName')}
                    className={cn(
                      'h-11 px-3.5 text-sm bg-[var(--bg-input)] border rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)]',
                      errors.firstName ? 'border-[var(--danger)]' : 'border-[var(--border)] focus:border-[var(--accent)]',
                    )} />
                  {errors.firstName && <p className="text-xs text-[var(--danger)]">{errors.firstName.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-[13px] font-semibold text-[var(--text-primary)]">Last name</label>
                  <input id="lastName" type="text" placeholder="Doe" {...register('lastName')}
                    className={cn(
                      'h-11 px-3.5 text-sm bg-[var(--bg-input)] border rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)]',
                      errors.lastName ? 'border-[var(--danger)]' : 'border-[var(--border)] focus:border-[var(--accent)]',
                    )} />
                  {errors.lastName && <p className="text-xs text-[var(--danger)]">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-semibold text-[var(--text-primary)]">Email address</label>
                <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')}
                  className={cn(
                    'h-11 px-3.5 text-sm bg-[var(--bg-input)] border rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)]',
                    errors.email ? 'border-[var(--danger)]' : 'border-[var(--border)] focus:border-[var(--accent)]',
                  )} />
                {errors.email && <p className="text-xs text-[var(--danger)]">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[13px] font-semibold text-[var(--text-primary)]">Password</label>
                <div className="relative">
                  <input id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="Min 6 characters" {...register('password')}
                    className={cn(
                      'w-full h-11 pl-3.5 pr-11 text-sm bg-[var(--bg-input)] border rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)]',
                      errors.password ? 'border-[var(--danger)]' : 'border-[var(--border)] focus:border-[var(--accent)]',
                    )} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[var(--danger)]">{errors.password.message}</p>}
              </div>

              <MagButton type="submit" variant="primary" size="md" disabled={isSubmitting} className="mt-1 w-full h-[48px]">
                {isSubmitting ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Create account <ArrowRight className="h-4 w-4" /></>
                )}
              </MagButton>
            </form>
          </Reveal>

          <Reveal delay={280}>
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[var(--accent-text)] hover:underline">
                Sign in
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
