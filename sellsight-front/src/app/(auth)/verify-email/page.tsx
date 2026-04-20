'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/services';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus]           = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!token) { setStatus('error'); setErrorMessage('No verification token found in URL.'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <Reveal className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center shadow-lg">
          {/* Logo */}
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
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">
                Thank you for verifying your email address. Your account is now fully active.
              </p>
              <Link href="/login">
                <MagButton variant="primary" className="w-full">Continue to Login</MagButton>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <XCircle className="mx-auto h-14 w-14 mb-4" style={{ color: 'var(--danger)' }} />
              <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2">Verification Failed</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">{errorMessage}</p>
              <Link href="/login">
                <MagButton variant="secondary" className="w-full">Return to Login</MagButton>
              </Link>
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
