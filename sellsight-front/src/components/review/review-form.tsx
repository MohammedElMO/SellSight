'use client';

import { useState } from 'react';
import { StarRating } from './star-rating';
import { useCreateReview } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { isAuthenticated, role } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const createReview = useCreateReview();

  if (!isAuthenticated || role !== 'CUSTOMER') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !title.trim()) return;
    createReview.mutate({
      productId,
      rating,
      title: title.trim(),
      body: body.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-[#e5e4e0] rounded-xl p-5 bg-[#fafaf8]">
      <h3 className="text-sm font-semibold text-[#111] mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-xs text-[#666] mb-1.5">Your Rating</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div className="mb-4">
        <label htmlFor="review-title" className="block text-xs text-[#666] mb-1.5">Title</label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={200}
          className="w-full h-10 px-3.5 text-sm bg-white border border-[#e5e4e0] rounded-lg text-[#111] placeholder:text-[#aaa] outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/8 transition-all"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="review-body" className="block text-xs text-[#666] mb-1.5">Details (optional)</label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Share more about your experience…"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#e5e4e0] rounded-lg text-[#111] placeholder:text-[#aaa] outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/8 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || !title.trim() || createReview.isPending}
        className="h-10 px-5 text-sm font-medium bg-[#111] text-white rounded-lg hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {createReview.isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
