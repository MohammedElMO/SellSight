'use client';

import { StarRating } from './star-rating';
import { BadgeCheck, ThumbsUp } from 'lucide-react';
import type { ReviewDto } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/auth';
import { useVoteReviewHelpful } from '@/lib/hooks';

interface ReviewCardProps {
  review: ReviewDto;
  productId: string;
}

export function ReviewCard({ review, productId }: ReviewCardProps) {
  const name = [review.customerFirstName, review.customerLastName]
    .filter(Boolean)
    .join(' ') || 'Anonymous';
  const { isAuthenticated, role } = useAuthStore();
  const voteHelpful = useVoteReviewHelpful(productId);

  return (
    <div className="border border-[#e5e4e0] rounded-xl p-5 bg-white transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[#111]">{name}</span>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <BadgeCheck size={13} />
                Verified
              </span>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-[#999] whitespace-nowrap">
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Title + body */}
      <h4 className="font-semibold text-sm text-[#111] mb-1">{review.title}</h4>
      {review.body && (
        <p className="text-sm text-[#555] leading-relaxed">{review.body}</p>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-3 mt-3">
        {isAuthenticated && role === 'CUSTOMER' && (
          <button
            onClick={() => voteHelpful.mutate(review.id)}
            disabled={voteHelpful.isPending}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#555] transition-colors"
          >
            <ThumbsUp size={12} />
            Helpful
          </button>
        )}
        {review.helpfulCount > 0 && (
          <span className="text-xs text-[#aaa]">
            {review.helpfulCount} found helpful
          </span>
        )}
      </div>
    </div>
  );
}
