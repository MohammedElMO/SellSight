'use client';

import { useProductReviews } from '@/lib/hooks';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { StarRating } from './star-rating';

interface ReviewSectionProps {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
}

export function ReviewSection({ productId, ratingAvg, ratingCount }: ReviewSectionProps) {
  const { data: reviews, isLoading } = useProductReviews(productId);

  return (
    <section className="mt-12 pt-10 border-t border-[#e5e4e0]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#111] mb-1">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={ratingAvg} size="sm" />
            <span className="text-sm text-[#666]">
              {ratingAvg.toFixed(1)} out of 5 ({ratingCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Review list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-[#f5f5f3] animate-pulse" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((r) => <ReviewCard key={r.id} review={r} productId={productId} />)
          ) : (
            <p className="text-sm text-[#888]">No reviews yet. Be the first to share your experience!</p>
          )}
        </div>

        {/* Review form */}
        <div className="lg:sticky lg:top-24">
          <ReviewForm productId={productId} />
        </div>
      </div>
    </section>
  );
}
