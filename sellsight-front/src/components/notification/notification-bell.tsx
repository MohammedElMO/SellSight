'use client';

import { Bell } from 'lucide-react';
import { useUnreadCount, useNotifications, useMarkAllNotificationsRead } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const { data: count } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useNotificationSSE();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-10 w-10 rounded-full border border-[#e5e4e0] bg-white flex items-center justify-center hover:border-[#999] transition-all"
      >
        <Bell size={18} className="text-[#666]" />
        {typeof count === 'number' && count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-96 bg-white border border-[#e5e4e0] rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e4e0]">
            <h3 className="text-sm font-semibold text-[#111]">Notifications</h3>
            {typeof count === 'number' && count > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-[#666] hover:text-[#111] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-72">
            {!notifications || notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#999]">No notifications</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-[#f0f0ee] last:border-0 transition-colors ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-[#111] leading-tight">{n.title}</h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-[#666] mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <span className="text-[10px] text-[#aaa] mt-1 block">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
