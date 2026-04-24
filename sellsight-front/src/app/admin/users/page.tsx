'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/lib/hooks';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Shield, ShoppingBag, Store } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Role } from '@shared/types';
import { cn } from '@/lib/utils';

const roleIcon = (role: Role) => {
  if (role === 'ADMIN')   return Shield;
  if (role === 'SELLER')  return Store;
  return ShoppingBag;
};

const roleVariant = (role: Role): 'accent' | 'secondary' | 'subtle' => {
  if (role === 'ADMIN')   return 'secondary';
  if (role === 'SELLER')  return 'accent';
  return 'subtle';
};

export default function AdminUsersPage() {
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const { data: users = [], isLoading } = useAdminUsers();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">
              User Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {isLoading ? '…' : `${users.length} total users`}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--bg-input)] flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            />
          </div>
          {(['ALL', 'CUSTOMER', 'SELLER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="h-10 px-4 rounded-[var(--radius-xs)] text-[12px] font-medium transition-all capitalize"
              style={
                roleFilter === r
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-[var(--radius)]" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ background: 'var(--surface)', gridTemplateColumns: '2fr 2fr 0.8fr 0.8fr' }}
            >
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)] font-medium">No users found</p>
              </div>
            ) : (
              filtered.map((u) => {
                const Icon = roleIcon(u.role);
                return (
                  <div
                    key={u.id}
                    className="grid gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                    style={{ gridTemplateColumns: '2fr 2fr 0.8fr 0.8fr' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-none"
                        style={{ background: 'var(--gradient)' }}
                      >
                        {`${u.firstName[0]}${u.lastName[0]}`.toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>

                    <span className="text-[13px] text-[var(--text-secondary)] truncate">{u.email}</span>

                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <Pill variant={roleVariant(u.role)} size="sm">
                        {u.role.toLowerCase()}
                      </Pill>
                    </div>

                    <span className="text-[12px] text-[var(--text-tertiary)]">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Reveal>
    </PageLayout>
  );
}
