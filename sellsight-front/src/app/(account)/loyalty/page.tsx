'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '@/lib/services';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { AnimCounter } from '@/components/ui/anim-counter';
import { Pill } from '@/components/ui/pill';
import { Star, ArrowUp, ArrowDown, Trophy, Award, Medal } from 'lucide-react';

import { formatDistanceToNow } from '@/lib/utils';

const TIER_GRADIENT: Record<string, string> = {
  BRONZE: 'linear-gradient(135deg, #92400e, #d97706)',
  SILVER: 'linear-gradient(135deg, #9ca3af, #e5e7eb)',
  GOLD:   'linear-gradient(135deg, #d97706, #fef08a)',
};

const TIER_ICONS: Record<string, React.ElementType> = { BRONZE: Award, SILVER: Medal, GOLD: Trophy };

export default function LoyaltyPage() {
  const { data: account, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: loyaltyApi.getAccount,
  });

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
                    {React.createElement(TIER_ICONS[account.tier] ?? Trophy, { className: 'h-8 w-8 opacity-90' })}
                    {account.tier}
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
          <div className="mb-4">
            <Reveal delay={120}>
              <TiltCard intensity={4} className="bg-[var(--bg-card)] rounded-[var(--radius)] p-5 cursor-default">
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center mb-3" style={{ background: 'var(--accent-muted)' }}>
                  <Star className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-1">Lifetime Spend</p>
                <p className="font-display font-bold text-[17px] text-[var(--text-primary)]">${account.lifetimeSpend.toFixed(2)}</p>
              </TiltCard>
            </Reveal>
          </div>

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
