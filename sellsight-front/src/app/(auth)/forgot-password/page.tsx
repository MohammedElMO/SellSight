'use client';

import { useState } from 'react';
import { authApi } from '@/lib/services';
import { toast } from 'sonner';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset email sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <Reveal className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-[var(--radius-xs)] flex items-center justify-center" style={{ background: 'var(--gradient)' }}>
              <span className="text-white text-[14px] font-bold">S</span>
            </div>
            <span className="font-display font-extrabold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">SellSight</span>
          </div>

          {isSent ? (
            <div className="text-center">
              <div
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--success-bg)' }}
              >
                <CheckCircle className="h-7 w-7" style={{ color: 'var(--success)' }} />
              </div>
              <h1 className="font-display font-bold text-[22px] text-[var(--text-primary)] mb-2">Check your inbox</h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                We've sent a password reset link to <strong className="text-[var(--text-primary)]">{email}</strong>.
              </p>
              <MagButton variant="secondary" className="w-full" onClick={() => setIsSent(false)}>
                Try a different email
              </MagButton>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2 tracking-[-0.02em]">Reset password</h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full h-11 pl-10 pr-4 text-[14px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <MagButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </MagButton>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent-text)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to login
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
