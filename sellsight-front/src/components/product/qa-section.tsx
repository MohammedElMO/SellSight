'use client';

import { useState } from 'react';
import { useProductQuestions, useAskQuestion, useAnswerQuestion } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QASectionProps {
  productId: string;
}

export function QASection({ productId }: QASectionProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: questions, isLoading } = useProductQuestions(productId);
  const askQuestion = useAskQuestion();
  const answerQuestion = useAnswerQuestion();
  const [newQuestion, setNewQuestion] = useState('');
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});

  const handleAsk = () => {
    if (!newQuestion.trim()) return;
    askQuestion.mutate({ productId, body: newQuestion.trim() }, {
      onSuccess: () => setNewQuestion(''),
    });
  };

  const handleAnswer = (questionId: string) => {
    const body = answerMap[questionId]?.trim();
    if (!body) return;
    answerQuestion.mutate({ questionId, body }, {
      onSuccess: () => setAnswerMap((m) => ({ ...m, [questionId]: '' })),
    });
  };

  return (
    <section className="mt-10 pt-8 border-t border-[#e5e4e0]">
      <h2 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
        <MessageSquare size={20} />
        Questions & Answers
        {questions && <span className="text-sm font-normal text-[#999]">({questions.length})</span>}
      </h2>

      {/* Ask a question */}
      {isAuthenticated && (
        <div className="flex gap-2 mb-6">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this product…"
            className="flex-1 h-10 px-3.5 text-sm bg-white border border-[#e5e4e0] rounded-lg text-[#111] placeholder:text-[#aaa] outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/8 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={!newQuestion.trim() || askQuestion.isPending}
            className="h-10 px-4 text-sm font-medium bg-[#111] text-white rounded-lg hover:bg-[#333] disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Send size={14} />
            Ask
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-[#f5f5f3] rounded-xl animate-pulse" />)}
        </div>
      ) : !questions || questions.length === 0 ? (
        <p className="text-sm text-[#888] py-4">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border border-[#e5e4e0] rounded-xl bg-white">
              <div className="px-5 py-4">
                <p className="text-sm font-medium text-[#111] mb-1">Q: {q.body}</p>
                <span className="text-xs text-[#999]">
                  {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Answers */}
              {q.answers.length > 0 && (
                <div className="border-t border-[#f0f0ee] divide-y divide-[#f0f0ee]">
                  {q.answers.map((a) => (
                    <div key={a.id} className="px-5 py-3 bg-[#fafaf8]">
                      <p className="text-sm text-[#555]">A: {a.body}</p>
                      <span className="text-xs text-[#999]">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer form */}
              {isAuthenticated && (
                <div className="px-5 py-3 border-t border-[#f0f0ee]">
                  <div className="flex gap-2">
                    <input
                      value={answerMap[q.id] || ''}
                      onChange={(e) => setAnswerMap((m) => ({ ...m, [q.id]: e.target.value }))}
                      placeholder="Write an answer…"
                      className="flex-1 h-8 px-3 text-xs bg-[#f5f5f3] border border-transparent rounded-lg text-[#111] placeholder:text-[#aaa] outline-none focus:border-[#e5e4e0] focus:bg-white transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer(q.id)}
                    />
                    <button
                      onClick={() => handleAnswer(q.id)}
                      disabled={!answerMap[q.id]?.trim()}
                      className="h-8 px-3 text-xs font-medium bg-[#111] text-white rounded-lg hover:bg-[#333] disabled:opacity-40 transition-all"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
