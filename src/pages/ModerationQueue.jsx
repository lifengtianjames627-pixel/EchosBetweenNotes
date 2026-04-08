import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Check, X, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  pending_review: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Pending Review' },
  approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Approved' },
  blocked: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Blocked' },
};

function ReviewCard({ review, onApprove, onReject, isPending }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_COLORS[review.moderation_status] || STATUS_COLORS.pending_review;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{review.reviewer_name || 'Anonymous'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {review.moderation_confidence != null && (
              <span className="text-xs opacity-50">confidence: {Math.round(review.moderation_confidence * 100)}%</span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(160,175,220,0.6)' }}>
            {review.album_title} · {review.album_artist}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onApprove(review.id)}
            disabled={isPending || review.moderation_status === 'approved'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', opacity: review.moderation_status === 'approved' ? 0.4 : 1 }}
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => onReject(review.id)}
            disabled={isPending || review.moderation_status === 'blocked'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', opacity: review.moderation_status === 'blocked' ? 0.4 : 1 }}
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      </div>

      {/* AI flag info */}
      {review.moderation_reason && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
          <div>
            <p className="text-xs" style={{ color: '#fbbf24' }}>{review.moderation_reason}</p>
            {review.moderation_categories?.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {review.moderation_categories.map(cat => (
                  <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>{cat}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review content */}
      <div>
        {review.title && <p className="text-xs italic mb-1" style={{ color: 'rgba(165,138,252,0.8)' }}>"{review.title}"</p>}
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,210,230,0.8)' }}>
          {expanded ? review.content : review.content?.slice(0, 200) + (review.content?.length > 200 ? '…' : '')}
        </p>
        {review.content?.length > 200 && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgba(165,138,252,0.7)' }}>
            {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function ModerationQueue() {
  const [filter, setFilter] = useState('pending_review');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['moderation-reviews', filter],
    queryFn: () => base44.entities.Review.filter(
      filter === 'all' ? {} : { moderation_status: filter },
      '-created_date',
      100
    ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Review.update(id, { moderation_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['item-reviews'] });
    },
  });

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
        <div className="text-center" style={{ color: 'rgba(160,175,220,0.6)' }}>
          <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Admin access required.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'pending_review', label: 'Pending', icon: Clock },
    { key: 'blocked', label: 'Blocked', icon: X },
    { key: 'approved', label: 'Approved', icon: Check },
    { key: 'all', label: 'All', icon: Shield },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)' }}>
            <Shield className="w-5 h-5" style={{ color: '#a5b4fc' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Moderation Queue</h1>
            <p className="text-xs" style={{ color: 'rgba(160,175,220,0.5)' }}>Review flagged content before it goes public</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={filter === key
                ? { background: 'rgba(124,111,255,0.2)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(160,175,220,0.5)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'rgba(160,175,220,0.4)' }}>
            <Check className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No reviews in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs mb-4" style={{ color: 'rgba(160,175,220,0.4)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            <AnimatePresence>
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isPending={updateStatus.isPending}
                  onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
                  onReject={(id) => updateStatus.mutate({ id, status: 'blocked' })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}