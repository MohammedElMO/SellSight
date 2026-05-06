'use client';

import { useState, useMemo } from 'react';
import {
  useAdminSessions,
  useAdminRevokeSession,
  useAdminRevokeFamilySessions,
  useDebounce,
} from '@/lib/hooks';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { ShieldOff, Search, Lock, Users, Info, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionDto } from '@shared/types';

// ── helpers ──────────────────────────────────────────────────

function statusVariant(s: SessionDto['status']): 'success' | 'danger' | 'subtle' {
  if (s === 'ACTIVE')  return 'success';
  if (s === 'REVOKED') return 'danger';
  return 'subtle';
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function truncate(str?: string, n = 40) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ── Session detail modal ──────────────────────────────────────

function SessionDetailModal({ session, onClose }: { session: SessionDto; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Session Details" size="md">
      <div className="space-y-3 text-sm">
        {[
          ['ID',           session.id],
          ['User',         session.userEmail ?? session.userId],
          ['Status',       session.status],
          ['IP Address',   session.ipAddress ?? '—'],
          ['Device',       session.deviceInfo ?? '—'],
          ['User Agent',   session.userAgent ?? '—'],
          ['Created',      fmtDate(session.createdAt)],
          ['Last used',    fmtDate(session.lastUsedAt)],
          ['Expires',      fmtDate(session.expiresAt)],
          ['Revoked at',   fmtDate(session.revokedAt)],
          ['Token family', session.tokenFamilyId ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider self-start pt-0.5">{label}</span>
            <span className="text-[var(--text-primary)] font-mono text-[12px] break-all">{value as string}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function SuperAdminSessionsPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<'' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('');
  const [detailSession, setDetail] = useState<SessionDto | null>(null);
  const [revokeId, setRevokeId]   = useState<string | null>(null);
  const [familyId, setFamilyId]   = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 250);
  const { data: sessions = [], isLoading } = useAdminSessions();
  const revokeSession = useAdminRevokeSession();
  const revokeFamily  = useAdminRevokeFamilySessions();

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return sessions.filter((s) => {
      const matchSearch = !q
        || s.userEmail?.toLowerCase().includes(q)
        || s.userId.toLowerCase().includes(q)
        || s.ipAddress?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sessions, debouncedSearch, statusFilter]);

  const activeCount  = sessions.filter(s => s.status === 'ACTIVE').length;
  const revokedCount = sessions.filter(s => s.status === 'REVOKED').length;
  const expiredCount = sessions.filter(s => s.status === 'EXPIRED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Reveal>
        <div className="flex items-start gap-4 mb-7">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
          >
            <KeyRound className="h-5 w-5" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[26px] text-[var(--text-primary)] tracking-[-0.02em]">
              Session Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {isLoading
                ? 'Loading…'
                : `${sessions.length} total · ${activeCount} active · ${revokedCount} revoked · ${expiredCount} expired`}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Stat chips ── */}
      <Reveal delay={40}>
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { label: 'All',     value: '',        count: sessions.length },
            { label: 'Active',  value: 'ACTIVE',  count: activeCount     },
            { label: 'Expired', value: 'EXPIRED', count: expiredCount    },
            { label: 'Revoked', value: 'REVOKED', count: revokedCount    },
          ].map(({ label, value, count }) => (
            <button
              key={value || 'all'}
              onClick={() => setStatus(value as '' | 'ACTIVE' | 'EXPIRED' | 'REVOKED')}
              className={cn(
                'h-9 px-4 rounded-full text-[12px] font-medium transition-all',
                statusFilter === value
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface)]',
              )}
            >
              {label} ({count})
            </button>
          ))}

          {/* Search */}
          <div className="flex items-center gap-2 h-9 px-3.5 border border-[var(--border)] rounded-full bg-[var(--bg-input)] flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or IP…"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            />
          </div>
        </div>
      </Reveal>

      {/* ── Table ── */}
      <Reveal delay={80}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-[var(--radius)]" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            {/* Header */}
            <div
              className="grid gap-3 px-5 py-3 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 0.8fr 0.7fr', background: 'var(--surface)' }}
            >
              <span>User</span>
              <span>Status</span>
              <span>Created</span>
              <span>Last used</span>
              <span>IP</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)] font-medium">No sessions found</p>
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  className="grid gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-[var(--surface)] transition-colors"
                  style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 0.8fr 0.7fr' }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{s.userEmail ?? s.userId}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">{truncate(s.deviceInfo, 36)}</p>
                  </div>

                  <Pill variant={statusVariant(s.status)} size="sm">{s.status}</Pill>

                  <span className="text-[12px] text-[var(--text-secondary)]">{fmtDate(s.createdAt)}</span>
                  <span className="text-[12px] text-[var(--text-secondary)]">{fmtDate(s.lastUsedAt)}</span>
                  <span className="text-[12px] font-mono text-[var(--text-tertiary)]">{s.ipAddress ?? '—'}</span>

                  <div className="flex items-center gap-1 justify-end">
                    <button
                      title="View details"
                      onClick={() => setDetail(s)}
                      className="h-7 w-7 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>

                    {s.tokenFamilyId && (
                      <button
                        title="Revoke token family"
                        onClick={() => setFamilyId(s.tokenFamilyId!)}
                        className="h-7 w-7 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:bg-amber-50 hover:text-amber-600 transition-all"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {s.status === 'ACTIVE' && (
                      <button
                        title="Revoke session"
                        onClick={() => setRevokeId(s.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Reveal>

      {/* Detail modal */}
      {detailSession && (
        <SessionDetailModal session={detailSession} onClose={() => setDetail(null)} />
      )}

      {/* Revoke session confirm */}
      {revokeId && (
        <ConfirmModal
          open
          onClose={() => setRevokeId(null)}
          onConfirm={() => revokeSession.mutate(revokeId, { onSuccess: () => setRevokeId(null) })}
          title="Revoke Session"
          message="Revoke this session? The user will be logged out of this device on next request."
          confirmLabel="Revoke"
          destructive
          loading={revokeSession.isPending}
        />
      )}

      {/* Revoke family confirm */}
      {familyId && (
        <ConfirmModal
          open
          onClose={() => setFamilyId(null)}
          onConfirm={() => revokeFamily.mutate(familyId, { onSuccess: () => setFamilyId(null) })}
          title="Revoke Token Family"
          message="Revoke all tokens in this rotation chain? This indicates potential session compromise."
          confirmLabel="Revoke Family"
          destructive
          loading={revokeFamily.isPending}
        />
      )}
    </div>
  );
}
