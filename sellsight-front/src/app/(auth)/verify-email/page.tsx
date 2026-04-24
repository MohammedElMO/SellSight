'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Role } from '@shared/types';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [status, setStatus]             = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole]                 = useState<Role | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!token) { setStatus('error'); setErrorMessage('No verification token found in URL.'); return; }
    authApi.verifyEmail(token)
      .then((authData) => {
        login(authData);
        setRole(authData.role);
        setStatus('success');
        setTimeout(() => {
          if (authData.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else if (authData.role === 'SELLER' && authData.sellerStatus === 'PENDING') {
            router.push('/seller/pending-approval');
          } else if (authData.role === 'SELLER') {
            router.push('/seller/dashboard');
          } else {
            router.push('/products');
          }
        }, 2000);
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMessage(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            || 'Verification link is invalid or has expired.'
        );
      });
  }, [token, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <Reveal className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--gradient)' }}>
              <span className="text-white text-[14px] font-bold">S</span>
            </div>
            <span className="font-display font-extrabold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">SellSight</span>
          </div>

          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4" style={{ color: 'var(--accent)' }} />
              <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-2">Verifying your email…</h2>
              <p className="text-[14px] text-[var(--text-secondary)]">Please wait just a moment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <CheckCircle className="mx-auto h-14 w-14 mb-4" style={{ color: 'var(--success)' }} />
              <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2">Email Verified!</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-2">
                Your account is now fully active.
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)] mb-8">Taking you to your dashboard…</p>
              <div className="h-4 w-4 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin mx-auto" />
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <XCircle className="mx-auto h-14 w-14 mb-4" style={{ color: 'var(--danger)' }} />
              <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2">Verification Failed</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">{errorMessage}</p>
              <div className="flex flex-col gap-3">
                <Link href="/pending-verification">
                  <MagButton variant="primary" className="w-full">Resend verification email</MagButton>
                </Link>
                <Link href="/login">
                  <MagButton variant="secondary" className="w-full">Return to Login</MagButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailInner /></Suspense>;
}
