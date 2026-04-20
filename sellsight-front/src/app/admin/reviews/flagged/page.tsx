'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { Pill } from '@/components/ui/pill';
import { MagButton } from '@/components/ui/mag-button';
import { MessageSquare, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FLAGGED_REVIEWS = [
  { id: 'r1', reviewer: 'user_anon42',   product: 'Wireless Headphones',   content: 'This is fake! Company is a scam...', reason: 'Spam / misleading', flags: 7, date: 'Apr 16' },
  { id: 'r2', reviewer: 'competitor99',   product: 'Smart Home Hub',        content: 'Terrible product don\'t buy...', reason: 'Competitor manipulation', flags: 4, date: 'Apr 15' },
  { id: 'r3', reviewer: 'troll_user123',  product: 'Running Shoes',         content: '[offensive content removed]', reason: 'Hate speech', flags: 11, date: 'Apr 14' },
];

export default function FlaggedReviewsPage() {
  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Content Moderation</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{FLAGGED_REVIEWS.length} reviews flagged for review</p>
        </div>
      </Reveal>

      <div className="space-y-4">
        {FLAGGED_REVIEWS.map((r, i) => (
          <Reveal key={r.id} delay={i * 80}>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[12px] font-medium text-[var(--text-secondary)]">@{r.reviewer}</span>
                    <span className="text-[var(--text-tertiary)]">·</span>
                    <span className="text-[12px] text-[var(--text-tertiary)]">{r.date}</span>
                  </div>
                  <p className="text-[12px] text-[var(--accent-text)]">on: {r.product}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill variant="danger" size="sm">{r.reason}</Pill>
                  <span className="text-[12px] text-[var(--danger)] font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {r.flags}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] bg-[var(--surface)] rounded-[var(--radius-xs)] p-3 mb-4 italic">
                "{r.content}"
              </p>
              <div className="flex gap-2">
                <MagButton size="sm" variant="secondary" onClick={() => toast.success('Review approved — removed from queue')}>
                  <CheckCircle className="h-3.5 w-3.5" /> Dismiss
                </MagButton>
                <MagButton size="sm" variant="danger" onClick={() => toast.success('Review removed')}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete review
                </MagButton>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageLayout>
  );
}
