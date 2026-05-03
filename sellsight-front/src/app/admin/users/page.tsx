'use client';

import { useState, useCallback } from 'react';
import {
  useAdminUserList, useAdminUserDetail,
  useDisableUser, useEnableUser, useChangeUserRole,
  useAdminDeleteUser, useRestoreUser, useAdminRevokeUserSessions, useDebounce,
} from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Users, Search, Shield, ShoppingBag, Store, ChevronLeft, ChevronRight, MoreVertical, Eye, Lock, Unlock, Trash2, RefreshCcw, UserCog, RotateCcw } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AdminUserDto, Role } from '@shared/types';

// ── helpers ──────────────────────────────────────────────────

const roleIcon = (role: Role) => {
  if (role === 'ADMIN')  return Shield;
  if (role === 'SELLER') return Store;
  return ShoppingBag;
};

const roleVariant = (role: Role): 'accent' | 'secondary' | 'subtle' => {
  if (role === 'ADMIN')  return 'secondary';
  if (role === 'SELLER') return 'accent';
  return 'subtle';
};

function statusBadge(user: AdminUserDto) {
  if (user.deleted) return <Pill variant="danger"   size="sm">Deleted</Pill>;
  if (user.disabled) return <Pill variant="warning"  size="sm">Disabled</Pill>;
  return                     <Pill variant="success"  size="sm">Active</Pill>;
}

function avatar(u: AdminUserDto) {
  if (u.avatarUrl) {
    return <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-none" />;
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-none"
         style={{ background: 'var(--gradient)' }}>
      {`${u.firstName[0]}${u.lastName[0]}`.toUpperCase()}
    </div>
  );
}

// ── User detail modal ─────────────────────────────────────────

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading } = useAdminUserDetail(userId);

  return (
    <Modal open onClose={onClose} title="User Details" size="md">
      {isLoading || !user ? (
        <div className="space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            {avatar(user)}
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{user.firstName} {user.lastName}</p>
              <p className="text-[var(--text-secondary)]">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            {[
              ['Role',          user.role],
              ['Status',        user.deleted ? 'Deleted' : user.disabled ? 'Disabled' : 'Active'],
              ['Email verified',user.emailVerified ? 'Yes' : 'No'],
              ['Auth provider', user.authProvider],
              ['Seller status', user.sellerStatus ?? '—'],
              ['Active sessions', String(user.activeSessionCount)],
              ['Joined',        formatDate(user.createdAt)],
              ['Deleted at',    user.deletedAt ? formatDate(user.deletedAt) : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-medium text-[var(--text-primary)]">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-subtle)]">
            ID: {user.id}
          </p>
        </div>
      )}
    </Modal>
  );
}

// ── Role change modal ─────────────────────────────────────────

function ChangeRoleModal({
  user, onClose,
}: { user: AdminUserDto; onClose: () => void }) {
  const [selected, setSelected] = useState<Role>(user.role);
  const changeRole = useChangeUserRole();

  const confirm = () => {
    changeRole.mutate({ userId: user.id, role: selected }, { onSuccess: onClose });
  };

  return (
    <Modal open onClose={onClose} title="Change Role" size="sm">
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Changing role for <span className="font-semibold">{user.email}</span>
      </p>
      <div className="flex flex-col gap-2 mb-5">
        {(['CUSTOMER', 'SELLER', 'ADMIN'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setSelected(r)}
            className={cn(
              'h-10 px-4 rounded-[var(--radius-sm)] text-sm font-medium text-left transition-all border',
              selected === r
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-text)]'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="h-9 px-4 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] rounded-[8px] transition-all">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={selected === user.role || changeRole.isPending}
          className="h-9 px-4 text-sm font-medium bg-[#111] text-white rounded-[8px] disabled:opacity-50 transition-all hover:bg-[#333]"
        >
          {changeRole.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

// ── Row actions dropdown ──────────────────────────────────────

function ActionsMenu({ user, onView, onChangeRole }: {
  user: AdminUserDto;
  onView: () => void;
  onChangeRole: () => void;
}) {
  const [open, setOpen]         = useState(false);
  const [confirm, setConfirm]   = useState<'disable' | 'enable' | 'delete' | 'restore' | 'revoke' | null>(null);

  const disable   = useDisableUser();
  const enable    = useEnableUser();
  const del       = useAdminDeleteUser();
  const restore   = useRestoreUser();
  const revoke    = useAdminRevokeUserSessions();

  const close = useCallback(() => { setOpen(false); setConfirm(null); }, []);

  const CONFIRMS = {
    disable: {
      title: 'Disable Account',
      message: `Disable ${user.email}? All active sessions will be revoked. User cannot log in.`,
      label: 'Disable',
      action: () => disable.mutate(user.id, { onSuccess: close }),
      loading: disable.isPending,
    },
    enable: {
      title: 'Enable Account',
      message: `Re-enable ${user.email}? User will be able to log in again.`,
      label: 'Enable',
      action: () => enable.mutate(user.id, { onSuccess: close }),
      loading: enable.isPending,
    },
    delete: {
      title: 'Delete Account',
      message: `Permanently delete ${user.email}? This soft-deletes the account and revokes all sessions.`,
      label: 'Delete',
      action: () => del.mutate(user.id, { onSuccess: close }),
      loading: del.isPending,
    },
    restore: {
      title: 'Restore Account',
      message: `Restore ${user.email}? The account will be accessible again. The user will need to log in.`,
      label: 'Restore',
      action: () => restore.mutate(user.id, { onSuccess: close }),
      loading: restore.isPending,
    },
    revoke: {
      title: 'Revoke All Sessions',
      message: `Revoke all sessions for ${user.email}? User will be logged out of all devices.`,
      label: 'Revoke All',
      action: () => revoke.mutate(user.id, { onSuccess: close }),
      loading: revoke.isPending,
    },
  } as const;

  const items = [
    { icon: Eye,       label: 'View details',      action: () => { setOpen(false); onView(); } },
    { icon: UserCog,   label: 'Change role',        action: () => { setOpen(false); onChangeRole(); } },
    { icon: RefreshCcw,label: 'Revoke sessions',    action: () => setConfirm('revoke'), danger: false },
    ...(user.deleted
      ? [{ icon: RotateCcw, label: 'Restore account', action: () => setConfirm('restore'), danger: false }]
      : [
          ...(user.disabled
            ? [{ icon: Unlock, label: 'Enable account',  action: () => setConfirm('enable'),  danger: false }]
            : [{ icon: Lock,   label: 'Disable account', action: () => setConfirm('disable'), danger: true  }]),
          { icon: Trash2, label: 'Delete account', action: () => setConfirm('delete'), danger: true },
        ]),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-[6px] text-[var(--text-tertiary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-[10px] border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-left transition-colors',
                    item.danger
                      ? 'text-[#dc2626] hover:bg-red-50'
                      : 'text-[#333] hover:bg-[#f7f6f2]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-none" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {confirm && (
        <ConfirmModal
          open
          onClose={close}
          onConfirm={CONFIRMS[confirm].action}
          title={CONFIRMS[confirm].title}
          message={CONFIRMS[confirm].message}
          confirmLabel={CONFIRMS[confirm].label}
          destructive={confirm === 'disable' || confirm === 'delete'}
          loading={CONFIRMS[confirm].loading}
        />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(0);
  const [sort, setSort]           = useState('newest');
  const [detailId, setDetailId]   = useState<string | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserDto | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useAdminUserList({
    search: debouncedSearch || undefined,
    role:   roleFilter === 'ALL' ? undefined : roleFilter,
    status: statusFilter || undefined,
    page,
    size:   20,
    sort,
  });

  const users      = data?.users ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              User Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {isLoading ? '…' : `${total.toLocaleString()} users`}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Filters ── */}
      <Reveal delay={60}>
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--bg-input)] flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            />
          </div>

          {/* Role filter */}
          <div className="flex gap-1.5">
            {(['ALL', 'CUSTOMER', 'SELLER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(0); }}
                className={cn('h-10 px-3 rounded-[var(--radius-xs)] text-[12px] font-medium transition-all capitalize', roleFilter === r
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface)]')}
              >
                {r.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="h-10 px-3 rounded-[var(--radius-xs)] text-[12px] border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="deleted">Deleted</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-3 rounded-[var(--radius-xs)] text-[12px] border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="email">Email A-Z</option>
            <option value="role">Role</option>
          </select>
        </div>
      </Reveal>

      {/* ── Table ── */}
      <Reveal delay={100}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-[var(--radius)]" />)}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            {/* Header */}
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ gridTemplateColumns: '2fr 2fr 0.7fr 0.7fr 0.5fr 0.4fr' }}
            >
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
              <span />
            </div>

            {users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)] font-medium">No users found</p>
              </div>
            ) : (
              users.map((u) => {
                const Icon = roleIcon(u.role);
                return (
                  <div
                    key={u.id}
                    className="grid gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                    style={{ gridTemplateColumns: '2fr 2fr 0.7fr 0.7fr 0.5fr 0.4fr' }}
                  >
                    {/* User */}
                    <div className="flex items-center gap-3 min-w-0">
                      {avatar(u)}
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        {!u.emailVerified && (
                          <p className="text-[10px] text-[var(--warning)] font-medium">unverified</p>
                        )}
                      </div>
                    </div>

                    <span className="text-[13px] text-[var(--text-secondary)] truncate">{u.email}</span>

                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <Pill variant={roleVariant(u.role)} size="sm">{u.role.toLowerCase()}</Pill>
                    </div>

                    <div>{statusBadge(u)}</div>

                    <span className="text-[12px] text-[var(--text-tertiary)]">{formatDate(u.createdAt)}</span>

                    <div className="flex justify-end">
                      <ActionsMenu
                        user={u}
                        onView={() => setDetailId(u.id)}
                        onChangeRole={() => setRoleChangeUser(u)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-[12px] text-[var(--text-tertiary)]">
              Page {page + 1} of {totalPages} ({total.toLocaleString()} users)
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => goTo(page - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-[6px] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--surface)] transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => goTo(page + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-[6px] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--surface)] transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Reveal>

      {/* Modals */}
      {detailId && <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />}
      {roleChangeUser && <ChangeRoleModal user={roleChangeUser} onClose={() => setRoleChangeUser(null)} />}
    </PageLayout>
  );
}
