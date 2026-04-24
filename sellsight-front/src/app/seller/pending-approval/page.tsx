'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Clock, LogOut, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SellerPendingApprovalPage() {
  const { firstName, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <Reveal className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center shadow-lg">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ background: 'var(--gradient)' }}
            >
              <Eye className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-[20px] text-[var(--text-primary)] tracking-[-0.02em]">
              SellSight
            </span>
          </Link>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(245,158,11,.12)' }}
          >
            <Clock className="h-8 w-8" style={{ color: 'var(--warning)' }} />
          </div>

          <h1 className="font-display font-extrabold text-[24px] text-[var(--text-primary)] tracking-[-0.02em] mb-2">
            Application Pending
          </h1>

          <p className="text-[14px] text-[var(--text-secondary)] mb-2 leading-relaxed">
            Hi {firstName}, your seller application is under review.
          </p>
          <p className="text-[13px] text-[var(--text-tertiary)] mb-8 leading-relaxed">
            Our team will evaluate your application and notify you by email once a decision has been made. This typically takes 1–2 business days.
          </p>

          <div
            className="flex items-start gap-3 p-4 rounded-[var(--radius)] mb-6 text-left"
            style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)' }}
          >
            <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
            <p className="text-[13px] text-[var(--text-secondary)]">
              You'll receive an email at your registered address when your account is approved or if more information is needed.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-[var(--radius-sm)] text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </Reveal>
    </div>
  );
}
