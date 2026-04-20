import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, AlertTriangle, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { reviews, ratingDistribution } from '@/data/mockData';
import { useStore } from '@/store/useStore';

export function Reviews() {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { addToast } = useStore();

  const totalReviews = ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const avgRating = (ratingDistribution.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews).toFixed(1);
  const negativeReviews = reviews.filter((r) => r.rating <= 2);

  const handlePostReply = (_reviewId: number) => {
    if (!replyText.trim()) return;
    addToast({ message: 'Reply posted successfully!', type: 'success' });
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Summary + Distribution */}
      <div className="flex flex-col lg:flex-row gap-4">
        <GlassCard className="flex-[3]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const dist = ratingDistribution.find((d) => d.stars === stars);
              const count = dist?.count || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const color = stars >= 4 ? '#10B981' : stars === 3 ? '#F59E0B' : '#EF4444';

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-xs text-white w-6">{stars}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: (5 - stars) * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="flex-[2] flex flex-col items-center justify-center text-center">
          <p className="font-display text-6xl font-bold text-white">{avgRating}</p>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className={s <= Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
            ))}
          </div>
          <p className="text-sm text-white/50 mt-2">Based on {totalReviews} reviews</p>
          <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10">
            <ThumbsUp size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">+0.2 this month</span>
          </div>
        </GlassCard>
      </div>

      {/* Negative Review Alert */}
      {negativeReviews.length > 0 && (
        <GlassCard className="!border-l-[3px] !border-l-red-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="font-display text-lg font-semibold text-white">Attention Needed</h2>
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{negativeReviews.length} negative</span>
          </div>
          <div className="space-y-3">
            {negativeReviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={review.buyer.avatar} alt={review.buyer.name} className="w-7 h-7 rounded-full" />
                    <span className="text-sm text-white font-medium">{review.buyer.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/70 mb-3">{review.text}</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <ThumbsUp size={14} className="text-[#8B2FFF] flex-shrink-0" />
                  <p className="text-xs text-white/70">
                    <span className="text-[#8B2FFF] font-semibold">HELIX-BRAIN suggestion:</span> Thank you for your feedback. We apologize for the inconvenience and would love to make it right. Please reach out so we can discuss a solution.
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyText('Thank you for your feedback. We apologize for the inconvenience and would love to make it right.'); }}
                    className="text-xs text-[#00D4FF] hover:underline"
                  >
                    Use Suggestion
                  </button>
                  <button className="text-xs text-white/40 hover:text-white">Write Custom</button>
                  <button className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1 ml-auto">
                    <Flag size={12} />
                    Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Review List */}
      <GlassCard>
        <h2 className="font-display text-lg font-semibold text-white mb-4">All Reviews</h2>
        <div className="space-y-0 divide-y divide-white/[0.04]">
          {reviews.map((review) => (
            <div key={review.id} className="py-4 first:pt-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <img src={review.buyer.avatar} alt={review.buyer.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <span className="text-sm text-white font-medium">{review.buyer.name}</span>
                    <p className="text-[10px] text-white/40">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/70 mb-1">{review.text}</p>
              <p className="text-xs text-white/40 mb-2">{review.gig}</p>

              {review.reply && (
                <div className="ml-4 pl-3 border-l-2 border-purple-500/30 mb-2">
                  <p className="text-xs text-white/60"><span className="text-[#8B2FFF] font-medium">Your reply:</span> {review.reply}</p>
                </div>
              )}

              {replyingTo === review.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full h-20 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none resize-none transition-all"
                    placeholder="Write a response..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePostReply(review.id)}
                      className="px-4 h-8 rounded-lg gradient-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      className="px-4 h-8 rounded-lg bg-white/[0.06] text-white text-xs hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : !review.reply && (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="flex items-center gap-1.5 text-xs text-[#00D4FF] hover:underline mt-1"
                >
                  <MessageSquare size={12} />
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
