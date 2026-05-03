'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { authApi } from '@/lib/services';

const POLL_INTERVAL = 30;

function AccountSuspendedInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const email        = searchParams.get('email') ?? '';

  const [countdown, setCountdown] = useState(POLL_INTERVAL);
  const [checking, setChecking]   = useState(false);
  const [reactivated, setReactivated] = useState(false);

  // Use a ref so the interval closure always calls the latest version
  const checkingRef  = useRef(false);
  const reactivatedRef = useRef(false);

  const doCheck = useCallback(async () => {
    if (!email || checkingRef.current || reactivatedRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      const { status } = await authApi.checkAccountStatus(email);
      if (status === 'ACTIVE') {
        reactivatedRef.current = true;
        setReactivated(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch { /* ignore */ } finally {
      checkingRef.current = false;
      setChecking(false);
      setCountdown(POLL_INTERVAL);
    }
  }, [email, router]);

  // Stable countdown interval — uses ref so it never needs to be recreated
  const doCheckRef = useRef(doCheck);
  useEffect(() => { doCheckRef.current = doCheck; }, [doCheck]);

  useEffect(() => {
    const t = setInterval(() => {
      if (reactivatedRef.current) { clearInterval(t); return; }
      setCountdown((c) => {
        if (c <= 1) {
          doCheckRef.current();
          return POLL_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []); // runs once — stable via ref

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

          {/* Icon */}
          <div
            className="mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)' }}
          >
            <ShieldOff className="h-10 w-10" style={{ color: 'var(--warning)' }} />
          </div>

          {reactivated ? (
            <>
              <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-3">
                Account reactivated!
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                Your account is active again. Redirecting to sign in...
              </p>
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ background: 'var(--accent)', animation: 'fillBar 3s ease-in-out forwards' }} />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-3">
                Account suspended
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-2">
                Your account has been temporarily suspended.
              </p>
              {email && (
                <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-4 break-all">{email}</p>
              )}
              <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed mb-8">
                If you believe this is a mistake, please contact support. Status is checked automatically.
              </p>

              {/* Circular countdown */}
              <div className="flex flex-col items-center gap-3 mb-8">
                <div className="relative h-16 w-16">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (countdown / POLL_INTERVAL)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold text-[var(--text-primary)]">
                    {countdown}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Next check in {countdown}s</p>
              </div>

              <MagButton
                variant="secondary"
                className="w-full mb-3"
                onClick={doCheck}
                disabled={checking || !email}
              >
                {checking ? (
                  <div className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Check now
                  </>
                )}
              </MagButton>

              <p className="text-[13px] text-[var(--text-tertiary)]">
                <Link href="/login" className="font-semibold text-[var(--accent-text)] hover:underline">
                  Try signing in
                </Link>
              </p>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function AccountSuspendedPage() {
  return <Suspense><AccountSuspendedInner /></Suspense>;
}
