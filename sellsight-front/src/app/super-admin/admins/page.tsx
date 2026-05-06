'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/lib/services';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff, RefreshCw, RotateCcw, CheckCircle, XCircle, LogOut, Unlock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import type { AdminManagementDto } from '@shared/types';

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: ok ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--warning) 12%, transparent)',
        color: ok ? 'var(--success)' : 'var(--warning)',
      }}
    >
      {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', tempPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const create = useMutation({
    mutationFn: superAdminApi.createAdmin,
    onSuccess: (admin) => {
      toast.success(
        `Admin ${admin.firstName} ${admin.lastName} created. Share the temporary password out-of-band — they must change it on first login.`,
        { duration: 7000 }
      );
      qc.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
      onClose();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to create admin.');
    },
  });

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (form.tempPassword.length < 12) e.tempPassword = 'Minimum 12 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    create.mutate(form);
  };

  const field = (key: keyof typeof form, label: string, type: string = 'text', extra?: React.ReactNode) => (
    <div>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={key === 'tempPassword' ? (showPw ? 'text' : 'password') : type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full h-10 px-3 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)] transition-all"
        />
        {extra}
      </div>
      {errors[key] && <p className="text-[11px] text-[var(--danger)] mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 max-w-md w-full">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Create Admin Account</p>
        <p className="text-xs text-[var(--text-secondary)] mb-5">
          The admin must change the temporary password and configure 2FA on first login.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {field('firstName', 'First name')}
            {field('lastName',  'Last name')}
          </div>
          {field('email', 'Email', 'email')}
          {field('tempPassword', 'Temporary password', 'password',
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          <p className="text-[11px] text-[var(--text-tertiary)] -mt-1">
            Minimum 12 characters. Share out-of-band — never send via unencrypted channel.
          </p>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] text-white bg-[var(--accent)] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {create.isPending
                ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
                : 'Create admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminAdminsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<{ userId: string; action: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['super-admin', 'admins'],
    queryFn: superAdminApi.listAdmins,
  });

  const onError = (e: unknown) => {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
    toast.error(msg ?? 'Action failed.');
  };
  const onSuccess = (msg: string) => () => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
    setConfirm(null);
  };

  const force2fa      = useMutation({ mutationFn: superAdminApi.force2faSetup,    onSuccess: onSuccess('Forced 2FA re-setup.'),   onError });
  const reset2fa      = useMutation({ mutationFn: superAdminApi.reset2fa,         onSuccess: onSuccess('2FA reset.'),             onError });
  const approve2fa    = useMutation({ mutationFn: superAdminApi.approve2faSetup,  onSuccess: onSuccess('2FA setup approved.'),    onError });
  const disable       = useMutation({ mutationFn: superAdminApi.disableAdmin,     onSuccess: onSuccess('Admin disabled.'),        onError });
  const enable        = useMutation({ mutationFn: superAdminApi.enableAdmin,      onSuccess: onSuccess('Admin enabled.'),         onError });
  const revoke        = useMutation({ mutationFn: superAdminApi.revokeSessions,   onSuccess: onSuccess('Sessions revoked.'),      onError });
  const resetAttempts = useMutation({ mutationFn: superAdminApi.reset2faAttempts, onSuccess: onSuccess('Attempts reset.'),        onError });

  const handleAction = (userId: string, action: string) => setConfirm({ userId, action });

  const executeConfirm = () => {
    if (!confirm) return;
    const { userId, action } = confirm;
    if (action === 'force2fa')        force2fa.mutate(userId);
    else if (action === 'reset2fa')   reset2fa.mutate(userId);
    else if (action === 'approve2fa') approve2fa.mutate(userId);
    else if (action === 'disable')    disable.mutate(userId);
    else if (action === 'enable')     enable.mutate(userId);
    else if (action === 'revoke')     revoke.mutate(userId);
    else if (action === 'resetAttempts') resetAttempts.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Reveal>
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-bold text-[24px] text-[var(--text-primary)] tracking-[-0.02em] mb-1">
              Admin Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage all admin and super-admin accounts. Approve 2FA setup, reset credentials, disable accounts.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-[var(--radius-md)] hover:opacity-90 transition-opacity shrink-0"
            style={{ background: 'var(--gradient)' }}
          >
            <UserPlus className="h-4 w-4" />
            Create Admin
          </button>
        </div>
      </Reveal>

      {/* Create admin modal */}
      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} />}

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 max-w-sm w-full">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Confirm action</p>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Confirm: <strong>{confirm.action}</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                Cancel
              </button>
              <button onClick={executeConfirm} className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] text-white bg-[var(--accent)] hover:opacity-90 transition-opacity">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(admins ?? []).map((admin: AdminManagementDto) => (
          <Reveal key={admin.id} delay={40}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{admin.firstName} {admin.lastName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                      {admin.role}
                    </span>
                    {admin.disabled && <span className="text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] font-medium">Disabled</span>}
                    {admin.deleted  && <span className="text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] font-medium">Deleted</span>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{admin.email}</p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <StatusBadge label="2FA enabled" ok={admin.totpEnabled} />
                    {admin.setupRequired && (
                      <StatusBadge label={admin.setupApproved ? 'Setup approved' : 'Awaiting approval'} ok={admin.setupApproved} />
                    )}
                    {admin.resetRequired && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]">
                        <RefreshCw className="h-3 w-3" /> Reset required
                      </span>
                    )}
                  </div>

                  {admin.failed2faAttempts > 0 && (
                    <p className="text-xs text-[var(--danger)]">
                      Failed 2FA attempts: {admin.failed2faAttempts}{admin.failed2faAttempts >= 5 ? ' — LOCKED' : ''}
                    </p>
                  )}
                  {admin.last2faVerifiedAt && (
                    <p className="text-xs text-[var(--text-tertiary)]">Last verified: {new Date(admin.last2faVerifiedAt).toLocaleString()}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {!admin.totpEnabled && admin.setupRequired && !admin.setupApproved && (
                    <button onClick={() => handleAction(admin.id, 'approve2fa')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)] border border-[var(--success)]/20 hover:opacity-80 transition-opacity">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  <button onClick={() => handleAction(admin.id, 'reset2fa')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset 2FA
                  </button>
                  <button onClick={() => handleAction(admin.id, 'force2fa')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" /> Force Re-setup
                  </button>
                  {admin.failed2faAttempts >= 5 && (
                    <button onClick={() => handleAction(admin.id, 'resetAttempts')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)] border border-[var(--warning)]/20 hover:opacity-80 transition-opacity">
                      <Unlock className="h-3.5 w-3.5" /> Unlock
                    </button>
                  )}
                  <button onClick={() => handleAction(admin.id, 'revoke')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Revoke Sessions
                  </button>
                  {admin.disabled
                    ? (
                      <button onClick={() => handleAction(admin.id, 'enable')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)] border border-[var(--success)]/20 hover:opacity-80 transition-opacity">
                        <ShieldCheck className="h-3.5 w-3.5" /> Enable
                      </button>
                    ) : (
                      <button onClick={() => handleAction(admin.id, 'disable')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] border border-[var(--danger)]/20 hover:opacity-80 transition-opacity">
                        <ShieldOff className="h-3.5 w-3.5" /> Disable
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {!isLoading && (!admins || admins.length === 0) && (
          <p className="text-sm text-[var(--text-secondary)] text-center py-12">No admins found.</p>
        )}
      </div>
    </div>
  );
}
