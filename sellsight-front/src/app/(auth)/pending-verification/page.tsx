'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { MailOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { AuthResponse } from '@shared/types';

const RESEND_COOLDOWN = 60;

function PendingVerificationInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromQuery = searchParams.get('email');
  const emailFromStore = useAuthStore((s) => s.email);
  const login = useAuthStore((s) => s.login);
  const email = emailFromQuery ?? emailFromStore ?? '';

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending]   = useState(false);

  // Listen for email verification from another tab (e.g., email client opened verify link)
  useEffect(() => {
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel('sellsight_auth');
      ch.onmessage = (e: MessageEvent<{ type: string; data: AuthResponse }>) => {
        if (e.data?.type === 'EMAIL_VERIFIED') {
          login(e.data.data);
          const { role, sellerStatus } = e.data.data;
          if (role === 'ADMIN') router.push('/admin/dashboard');
          else if (role === 'SELLER' && sellerStatus === 'PENDING') router.push('/seller/pending-approval');
          else if (role === 'SELLER') router.push('/seller/dashboard');
          else router.push('/products');
        }
      };
    } catch {
      // BroadcastChannel not supported in all environments
    }
    return () => { try { ch?.close(); } catch { /* ignore */ } };
  }, [login, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0 || sending) return;
    setSending(true);
    try {
      await authApi.resendVerification(email);
    } catch {
      // silently ignore — backend never leaks email existence
    } finally {
      setSending(false);
      toast.success('Verification email sent! Check your inbox.');
      setCooldown(RESEND_COOLDOWN);
    }
  };

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
            style={{ background: 'var(--accent-muted)' }}
          >
            <MailOpen className="h-10 w-10" style={{ color: 'var(--accent)' }} />
          </div>

          <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-3">
            Check your inbox
          </h2>

          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-2">
            We sent a verification link to
          </p>
          {email && (
            <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-6 break-all">
              {email}
            </p>
          )}
          <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed mb-8">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>

          {/* Resend */}
          <MagButton
            variant="primary"
            className="w-full mb-3"
            onClick={resend}
            disabled={cooldown > 0 || sending || !email}
          >
            {sending ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
              </>
            )}
          </MagButton>

          <p className="text-[13px] text-[var(--text-tertiary)]">
            Already verified?{' '}
            <Link href="/login" className="font-semibold text-[var(--accent-text)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export default function PendingVerificationPage() {
  return <Suspense><PendingVerificationInner /></Suspense>;
}
