'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { notificationApi } from '@/lib/services';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Bell, CheckCheck, Mail, MailOpen } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/utils';
import type { NotificationDto } from '@shared/types';

function resolveNavTarget(n: NotificationDto): string | null {
  if (!n.dataJson) return null;
  try {
    const data = JSON.parse(n.dataJson);
    if (n.type === 'BACK_IN_STOCK' && data.productId) return `/products/${data.productId}`;
    if (n.type.startsWith('ORDER_') && data.orderId) return `/orders/${data.orderId}`;
  } catch { /* ignore malformed JSON */ }
  return null;
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [flashId, setFlashId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  useEffect(() => {
    if (!highlightId || !notifications?.length) return;
    setFlashId(highlightId);
    const timer = setTimeout(() => setFlashId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightId, notifications]);

  useEffect(() => {
    if (flashId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [flashId]);

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="w-full">
      <Reveal>
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Notifications</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
          </div>
          {unread > 0 && (
            <MagButton
              variant="secondary"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </MagButton>
          )}
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 animate-pulse">
              <div className="h-4 w-48 bg-[var(--surface)] rounded mb-2" />
              <div className="h-3 w-80 bg-[var(--surface)] rounded" />
            </div>
          ))}
        </div>
      ) : !notifications?.length ? (
        <Reveal delay={60}>
          <div
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[var(--radius-lg)] text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Bell className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <h3 className="font-semibold text-[16px] text-[var(--text-secondary)] mb-2">No notifications</h3>
            <p className="text-[13px] text-[var(--text-tertiary)]">We'll keep you posted on orders, reviews, and deals.</p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const isFlashing = flashId === n.id;
            return (
            <Reveal key={n.id} delay={i * 40}>
              <div
                ref={isFlashing ? highlightRef : null}
                className="bg-[var(--bg-card)] border rounded-[var(--radius)] p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--surface)] transition-all"
                style={
                  isFlashing
                    ? { borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'var(--accent)', borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)', borderBottomColor: 'var(--accent)', background: 'oklch(from var(--accent) 0.97 0.02 h)', outline: '2px solid var(--accent)', outlineOffset: '2px' }
                    : !n.read
                      ? { borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'var(--accent)', borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }
                      : { opacity: 0.75, borderColor: 'var(--border)' }
                }
                onClick={() => {
                  if (!n.read) markReadMutation.mutate(n.id);
                  const target = resolveNavTarget(n);
                  if (target) router.push(target);
                }}
              >
                <div className="mt-0.5 shrink-0">
                  {n.read
                    ? <MailOpen className="h-4 w-4 text-[var(--text-tertiary)]" />
                    : <Mail className="h-4 w-4 text-[var(--accent-text)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                  >
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 opacity-60">
                    {formatDistanceToNow(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: 'var(--accent)' }} />
                )}
              </div>
            </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
