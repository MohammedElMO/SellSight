'use client';

import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '@/lib/services';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { Pill } from '@/components/ui/pill';
import { Star, ArrowUp, ArrowDown, Gift, Users, Trophy, Copy, Check, Share2 } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

const TIER_GRADIENT: Record<string, string> = {
  BRONZE: 'linear-gradient(135deg, #92400e, #d97706)',
  SILVER: 'linear-gradient(135deg, #9ca3af, #e5e7eb)',
  GOLD:   'linear-gradient(135deg, #d97706, #fef08a)',
};

const TIER_ICONS: Record<string, string> = { BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇' };

export default function LoyaltyPage() {
  const [copied, setCopied] = useState(false);
  const { data: account, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: loyaltyApi.getAccount,
  });

  const copyReferralCode = () => {
    if (!account?.referralCode) return;
    const shareUrl = `${window.location.origin}/register?ref=${account.referralCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full">
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Loyalty Program</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Earn points, unlock rewards</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-10 animate-pulse">
          <div className="h-8 w-40 bg-[var(--surface)] rounded mb-4" />
          <div className="h-6 w-60 bg-[var(--surface)] rounded" />
        </div>
      ) : !account ? (
        <Reveal delay={60}>
          <div
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[var(--radius-lg)] text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Trophy className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <h3 className="font-semibold text-[16px] text-[var(--text-secondary)] mb-2">No loyalty account yet</h3>
            <p className="text-[13px] text-[var(--text-tertiary)]">Start shopping to earn reward points!</p>
          </div>
        </Reveal>
      ) : (
        <>
          {/* Tier card */}
          <Reveal delay={60}>
            <div
              className="rounded-[var(--radius-lg)] p-8 mb-6 text-white"
              style={{ background: TIER_GRADIENT[account.tier] || TIER_GRADIENT.BRONZE, boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-75 mb-1">Your Tier</p>
                  <h2 className="font-display font-bold text-[32px] flex items-center gap-2">
                    {TIER_ICONS[account.tier]} {account.tier}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75 mb-1">Available Points</p>
                  <p className="font-display font-bold text-[42px] leading-none">
                    {account.balance.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-60">≈ ${account.balanceAsDollars.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Lifetime Spend', value: `$${account.lifetimeSpend.toFixed(2)}`, icon: Star, },
              { label: 'Redeemable Value', value: `$${account.balanceAsDollars.toFixed(2)}`, icon: Gift, },
            ].map(({ label, value, icon: Icon }, i) => (
              <Reveal key={label} delay={120 + i * 60}>
                <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                  <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center mb-3" style={{ background: 'var(--accent-muted)' }}>
                    <Icon className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-1">{label}</p>
                  <p className="font-display font-bold text-[17px] text-[var(--text-primary)]">{value}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* Referral section */}
          <Reveal delay={240}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4 text-[var(--accent-text)]" />
                <h3 className="font-display font-semibold text-[14px] text-[var(--text-primary)]">Refer a Friend</h3>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mb-3">
                Share your referral link and earn 100 bonus points for every friend who makes their first purchase.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)]">
                  <Users className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                  <code className="text-[12px] font-mono text-[var(--text-primary)] truncate">{account.referralCode}</code>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] transition-all hover:bg-[var(--surface)]"
                  style={copied ? { borderColor: 'var(--success)', color: 'var(--success)' } : { color: 'var(--text-secondary)' }}
                  aria-label="Copy referral link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Reveal>

          {/* Transactions */}
          <Reveal delay={360}>
            <h3 className="font-display font-semibold text-[16px] text-[var(--text-primary)] mb-4">Recent Activity</h3>
            {!account.recentTransactions?.length ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center text-[13px] text-[var(--text-tertiary)]">
                No activity yet. Earn points by making purchases!
              </div>
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                <div className="divide-y divide-[var(--border-subtle)]">
                  {account.recentTransactions.map((tx) => {
                    const isEarn = tx.type !== 'REDEEM';
                    return (
                      <div key={tx.id} className="p-4 flex items-center gap-3 hover:bg-[var(--surface)] transition-colors">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: isEarn ? 'var(--success-bg)' : 'var(--danger-muted)', color: isEarn ? 'var(--success)' : 'var(--danger)' }}
                        >
                          {isEarn ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-[var(--text-primary)]">{tx.description}</p>
                          <p className="text-[11px] text-[var(--text-tertiary)]">{formatDistanceToNow(tx.createdAt)}</p>
                        </div>
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: isEarn ? 'var(--success)' : 'var(--danger)' }}
                        >
                          {isEarn ? '+' : '-'}{tx.points} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Reveal>
        </>
      )}
    </div>
  );
}
