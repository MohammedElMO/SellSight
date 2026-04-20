'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile, useDeleteAccount } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/pill';
import { User, Calendar, Mail, Clock, Pencil, X, Check, Trash2, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
});
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '' },
  });

  const startEdit = () => {
    reset({ firstName: profile?.firstName ?? '', lastName: profile?.lastName ?? '' });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: FormValues) => {
    updateProfile.mutate(values, { onSuccess: () => setEditing(false) });
  };

  return (
    <div className="w-full">
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">My Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account details</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-[var(--surface)]" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/3 bg-[var(--surface)] rounded" />
              <div className="h-4 w-1/4 bg-[var(--surface)] rounded" />
            </div>
          </div>
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar card */}
          <Reveal delay={60}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 text-center">
              <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
                style={{ background: 'var(--gradient)', boxShadow: '0 8px 32px var(--accent-glow)' }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <h2 className="font-display font-bold text-[18px] text-[var(--text-primary)]">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1 mb-3">{profile.role}</p>
              <Pill size="sm" variant="success">Active Account</Pill>
            </div>
          </Reveal>

          {/* Info card */}
          <Reveal delay={120} className="md:col-span-2">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-5">
                <h3 className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
                  Personal Information
                </h3>
                {!editing && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-text)] hover:opacity-80 transition-opacity"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] text-[var(--text-tertiary)] mb-1.5 block">First Name</label>
                      <Input {...register('firstName')} placeholder="First name" />
                      {errors.firstName && (
                        <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[12px] text-[var(--text-tertiary)] mb-1.5 block">Last Name</label>
                      <Input {...register('lastName')} placeholder="Last name" />
                      {errors.lastName && (
                        <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-[var(--text-tertiary)] mb-1.5 block">Email Address</label>
                    <Input value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Email cannot be changed here.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <MagButton
                      variant="primary"
                      type="submit"
                      disabled={updateProfile.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {updateProfile.isPending ? 'Saving…' : 'Save changes'}
                    </MagButton>
                    <MagButton variant="ghost" type="button" onClick={cancelEdit}>
                      <X className="h-3.5 w-3.5" /> Cancel
                    </MagButton>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { icon: User,     label: 'Full Name',      value: `${profile.firstName} ${profile.lastName}` },
                    { icon: Mail,     label: 'Email Address',  value: profile.email },
                    { icon: Calendar, label: 'Member Since',   value: formatDate(profile.createdAt) },
                    { icon: Clock,    label: 'Account Status', value: `${profile.role} (Verified)` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <p className="text-[12px] text-[var(--text-tertiary)] flex items-center gap-1.5 mb-1">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </p>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      ) : (
        <Reveal delay={60}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center text-[var(--danger)]">
            Failed to load profile.
          </div>
        </Reveal>
      )}

      {/* Danger zone */}
      {profile && (
        <Reveal delay={200}>
          <div className="mt-8 bg-[var(--bg-card)] border border-[var(--danger)] border-opacity-30 rounded-[var(--radius)] p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
              <h3 className="font-display font-semibold text-[14px] text-[var(--danger)]">Danger Zone</h3>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <MagButton variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete account
              </MagButton>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-[var(--radius-xs)] border border-[var(--danger)] bg-[var(--danger-muted)]">
                <p className="text-[13px] text-[var(--danger)] font-medium flex-1">Are you absolutely sure?</p>
                <MagButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</MagButton>
                <MagButton
                  variant="danger"
                  size="sm"
                  disabled={deleteAccount.isPending}
                  onClick={() => deleteAccount.mutate()}
                >
                  {deleteAccount.isPending ? 'Deleting…' : 'Yes, delete'}
                </MagButton>
              </div>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
