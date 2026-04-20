'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '@/lib/hooks';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';

const schema = z.object({
  oldPassword:     z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const [showOld,     setShowOld]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success,     setSuccess]     = useState(false);

  const changePassword = useChangePassword();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = ({ oldPassword, newPassword }: FormValues) => {
    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          setSuccess(true);
        },
      }
    );
  };

  return (
    <div className="w-full">
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Change Password</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Keep your account secure with a strong password</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          {success ? (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--success-muted, #dcfce7)' }}
              >
                <Check className="h-8 w-8" style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)] mb-2">Password Changed!</h2>
              <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                Your password has been updated successfully.
              </p>
              <MagButton variant="secondary" onClick={() => setSuccess(false)}>
                Change again
              </MagButton>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border-subtle)]">
                <div
                  className="h-10 w-10 rounded-[var(--radius-xs)] flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface)' }}
                >
                  <ShieldCheck className="h-5 w-5 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">Account Security</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">Use a strong, unique password</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Current password */}
                <div>
                  <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      {...register('oldPassword')}
                      type={showOld ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.oldPassword && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{errors.oldPassword.message}</p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      {...register('newPassword')}
                      type={showNew ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{errors.confirmPassword.message}</p>
                  )}
                </div>

                <MagButton
                  variant="primary"
                  type="submit"
                  disabled={changePassword.isPending}
                  className="mt-1"
                >
                  {changePassword.isPending ? 'Updating…' : 'Update Password'}
                </MagButton>
              </form>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}
