'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/services';
import { toast } from 'sonner';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { CheckCircle, XCircle, Lock } from 'lucide-react';
import Link from 'next/link';

const inputCls = 'w-full h-11 px-3.5 text-[14px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] transition-colors';
const labelCls = 'block text-[12px] font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-wider';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [isSuccess, setIsSuccess]             = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <Reveal className="w-full max-w-md">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center shadow-lg">
            <XCircle className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-2">Invalid Request</h2>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6">
              No reset token found. Please request a new password reset link.
            </p>
            <Link href="/forgot-password">
              <MagButton variant="primary" className="w-full">Request New Link</MagButton>
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password successfully reset');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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

          {isSuccess ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-14 w-14 mb-4" style={{ color: 'var(--success)' }} />
              <h2 className="font-display font-bold text-[22px] text-[var(--text-primary)] mb-2">Password Reset!</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Link href="/login">
                <MagButton variant="primary" className="w-full">Return to Login</MagButton>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2 tracking-[-0.02em]">
                Create new password
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                Choose a strong password for your account.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
                <MagButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? 'Resetting…' : 'Reset Password'}
                </MagButton>
              </form>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordInner /></Suspense>;
}
