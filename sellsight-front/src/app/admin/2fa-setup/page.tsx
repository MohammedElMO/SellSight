'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { admin2faApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff, Copy, Check, KeyRound, AlertTriangle, Lock } from 'lucide-react';
import { MagButton } from '@/components/ui/mag-button';
import { Reveal } from '@/components/ui/reveal';
import type { TotpSetupResponse } from '@shared/types';

type PageStep = 'loading' | 'password-change' | 'qr' | 'verify' | 'backup' | 'status' | 'disable';

export default function TwoFactorSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { role, isAuthenticated } = useAuthStore();

  const setupToken = searchParams.get('setup_token');
  const isSetupTokenFlow = !!setupToken;

  const [step, setStep] = useState<PageStep>('loading');
  const [qrData, setQrData] = useState<TotpSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Password-change step state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isSetupTokenFlow) {
      handleInitiateSetup();
    } else if (isAuthenticated) {
      admin2faApi.status().then(({ enabled: e }) => {
        setEnabled(e);
        setStep('status');
      }).catch(() => {
        toast.error('Failed to load 2FA status.');
        setStep('status');
      });
    } else {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInitiateSetup = async () => {
    if (!setupToken) return;
    try {
      const data = await admin2faApi.initiateSetup(setupToken);
      if (data.requiresPasswordChange) {
        setStep('password-change');
      } else if (data.qrCode) {
        setQrData(data);
        setStep('qr');
      } else {
        // Secret already generated but QR was lost (navigated away after bootstrap)
        setStep('verify');
      }
    } catch {
      toast.error('Invalid or expired setup link. Please log in again.');
      router.replace('/login');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 12) {
      setPasswordError('Password must be at least 12 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await admin2faApi.bootstrapChangePassword({ setupToken: setupToken!, newPassword });
      setQrData(data);
      setStep('qr');
      toast.success('Password updated. Now scan the QR code to set up 2FA.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupToken || !code.trim()) return;
    setSubmitting(true);
    try {
      const result = await admin2faApi.completeSetup(setupToken, code.trim());
      setBackupCodes(result.backupCodes);
      login({
        token: null,
        email: result.email,
        role: result.role,
        firstName: result.firstName,
        lastName: result.lastName,
        emailVerified: result.emailVerified,
        sellerStatus: result.sellerStatus,
      });
      setStep('backup');
      toast.success('2FA enabled! Save your backup codes.');
    } catch {
      toast.error('Invalid code. Make sure your phone clock is synced.');
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    router.push(role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/admin/dashboard');
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) return;
    setSubmitting(true);
    try {
      await admin2faApi.disable(disableCode.trim());
      setEnabled(false);
      setDisableCode('');
      setStep('status');
      toast.success('2FA disabled. You will need SUPER_ADMIN approval to re-enable.');
    } catch {
      toast.error('Invalid code.');
      setDisableCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = () => {
    if (!qrData?.secret) return;
    navigator.clipboard.writeText(qrData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Reveal>
        <div className="mb-8">
          <h1 className="font-display font-bold text-[24px] text-[var(--text-primary)] tracking-[-0.02em] mb-1">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Protect your admin account with a TOTP authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>
      </Reveal>

      {/* ── Setup-token flow banner ── */}
      {isSetupTokenFlow && step !== 'backup' && (
        <Reveal delay={40}>
          <div className="mb-6 flex items-start gap-3 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] border border-[var(--warning)]/30 rounded-[var(--radius-md)] p-4">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
            <p className="text-xs text-[var(--text-secondary)]">
              {step === 'password-change'
                ? 'You must change your temporary password and set up 2FA before accessing your dashboard.'
                : 'You must complete 2FA setup to access your dashboard. Scan the QR code with your authenticator app.'}
            </p>
          </div>
        </Reveal>
      )}

      {/* ── Step 0: Change temporary password (bootstrap only) ── */}
      {step === 'password-change' && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Step 1 — Change your temporary password</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Your account was created with a temporary password. Choose a strong password you have not used elsewhere.
              Minimum 12 characters.
            </p>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">New password</label>
                <input
                  type="password"
                  autoFocus
                  autoComplete="new-password"
                  placeholder="At least 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Confirm password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)]"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-[var(--danger)]">{passwordError}</p>
              )}

              <MagButton
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting || !newPassword || !confirmPassword}
                className="w-full"
              >
                {submitting
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : 'Set password & continue →'}
              </MagButton>
            </form>
          </div>
        </Reveal>
      )}

      {/* ── Step 1 (or 2 in bootstrap): Scan QR ── */}
      {step === 'qr' && qrData && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {isSetupTokenFlow ? 'Step 2 — Scan the QR code' : 'Step 1 — Scan the QR code'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Open your authenticator app and scan the code below.
            </p>

            <div className="flex justify-center mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${qrData.qrCode}`}
                alt="TOTP QR code"
                className="h-48 w-48 rounded-lg border border-[var(--border)]"
              />
            </div>

            {qrData.secret && (
              <div className="mb-5">
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">Can&apos;t scan? Enter this key manually:</p>
                <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] px-3 py-2">
                  <code className="flex-1 text-xs font-mono text-[var(--text-primary)] break-all">{qrData.secret}</code>
                  <button type="button" onClick={copySecret} className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                    {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
                  This secret is shown once. Store it securely if you need it as a backup.
                </p>
              </div>
            )}

            <MagButton variant="primary" size="md" onClick={() => setStep('verify')} className="w-full">
              I&apos;ve scanned it →
            </MagButton>
          </div>
        </Reveal>
      )}

      {/* ── Verify code step ── */}
      {step === 'verify' && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {isSetupTokenFlow ? 'Step 3 — Verify your code' : 'Step 2 — Verify your code'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              {!qrData
                ? 'Your QR code was already scanned. Enter the 6-digit code from your authenticator app.'
                : 'Enter the 6-digit code from your authenticator app to confirm setup.'}
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="h-11 px-3.5 text-sm text-center tracking-[0.3em] font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:tracking-normal outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)]"
              />
              <MagButton type="submit" variant="primary" size="md" disabled={submitting || code.length !== 6} className="w-full">
                {submitting
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : 'Enable 2FA'}
              </MagButton>
            </form>
            {qrData && (
              <button type="button" onClick={() => setStep('qr')} className="mt-3 w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                ← Back to QR code
              </button>
            )}
          </div>
        </Reveal>
      )}

      {/* ── Backup codes ── */}
      {step === 'backup' && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Save your backup codes</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Store these somewhere safe. Each code can be used once if you lose access to your authenticator app.
              These will not be shown again.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {backupCodes.map((c) => (
                <code key={c} className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[var(--radius-sm)] text-xs font-mono text-[var(--text-primary)] text-center">
                  {c}
                </code>
              ))}
            </div>

            <MagButton variant="primary" size="md" onClick={handleDone} className="w-full">
              Done — I&apos;ve saved my codes
            </MagButton>
          </div>
        </Reveal>
      )}

      {/* ── Status screen (authenticated, already-enabled admins) ── */}
      {step === 'status' && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: enabled
                  ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                  : 'color-mix(in srgb, var(--warning) 15%, transparent)' }}
              >
                {enabled
                  ? <ShieldCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />
                  : <ShieldOff className="h-5 w-5" style={{ color: 'var(--warning)' }} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">2FA is {enabled ? 'enabled' : 'disabled'}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {enabled
                    ? 'Your account requires a 6-digit code on every login.'
                    : 'Contact your Super Admin to initiate a new 2FA setup.'}
                </p>
              </div>
            </div>

            {enabled && (
              <button
                type="button"
                onClick={() => setStep('disable')}
                className="w-full py-2 text-sm font-medium text-[var(--danger)] border border-[var(--danger)]/30 rounded-[var(--radius-md)] hover:bg-[var(--danger)]/5 transition-colors"
              >
                Disable 2FA
              </button>
            )}
          </div>
        </Reveal>
      )}

      {/* ── Disable flow ── */}
      {step === 'disable' && (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Disable 2FA</p>
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              Enter your current authenticator code to confirm.
            </p>
            <p className="text-xs text-[var(--danger)] mb-5">
              After disabling, you will need SUPER_ADMIN approval before you can re-enable 2FA.
            </p>

            <form onSubmit={handleDisable} className="flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="h-11 px-3.5 text-sm text-center tracking-[0.3em] font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:tracking-normal outline-none transition-all focus:ring-2 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={submitting || disableCode.length !== 6}
                className="w-full py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white bg-[var(--danger)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
                  : 'Confirm disable'}
              </button>
            </form>
            <button type="button" onClick={() => { setStep('status'); setDisableCode(''); }} className="mt-3 w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              ← Cancel
            </button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
