'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { Users, Search, Shield, ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_USERS = [
  { id: '1', name: 'Alice Johnson',    email: 'alice@example.com',   role: 'CUSTOMER', status: 'active',   joined: 'Jan 2026' },
  { id: '2', name: 'Bob Martinez',     email: 'bob@example.com',     role: 'SELLER',   status: 'active',   joined: 'Feb 2026' },
  { id: '3', name: 'Carol Smith',      email: 'carol@example.com',   role: 'ADMIN',    status: 'active',   joined: 'Mar 2026' },
  { id: '4', name: 'David Lee',        email: 'david@example.com',   role: 'CUSTOMER', status: 'suspended',joined: 'Mar 2026' },
  { id: '5', name: 'Eva Williams',     email: 'eva@example.com',     role: 'SELLER',   status: 'active',   joined: 'Apr 2026' },
  { id: '6', name: 'Frank Brown',      email: 'frank@example.com',   role: 'CUSTOMER', status: 'active',   joined: 'Apr 2026' },
];

const roleIcon = (role: string) => {
  if (role === 'ADMIN')    return Shield;
  if (role === 'SELLER')   return Store;
  return ShoppingBag;
};

const roleVariant = (role: string): 'accent' | 'secondary' | 'subtle' => {
  if (role === 'ADMIN')   return 'secondary';
  if (role === 'SELLER')  return 'accent';
  return 'subtle';
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <PageLayout>
      <Reveal>
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">User Management</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{MOCK_USERS.length} total users</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--bg-input)] flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            />
          </div>
          {['ALL', 'CUSTOMER', 'SELLER', 'ADMIN'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="h-10 px-4 rounded-[var(--radius-xs)] text-[12px] font-medium transition-all capitalize"
              style={roleFilter === r
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]" style={{ background: 'var(--surface)' }}>
            <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Joined</span>
          </div>
          {filtered.map(u => {
            const Icon = roleIcon(u.role);
            return (
              <div key={u.id} className="grid grid-cols-[2fr_2fr_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-none" style={{ background: 'var(--gradient)' }}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">{u.name}</span>
                </div>
                <span className="text-[13px] text-[var(--text-secondary)] truncate">{u.email}</span>
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <Pill variant={roleVariant(u.role)} size="sm">{u.role.toLowerCase()}</Pill>
                </div>
                <Pill size="sm" variant={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Pill>
                <span className="text-[12px] text-[var(--text-tertiary)]">{u.joined}</span>
              </div>
            );
          })}
        </div>
      </Reveal>
    </PageLayout>
  );
}
