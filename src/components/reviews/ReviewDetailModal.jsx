import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SECTIONS = [
  ['band_style', 'Style'],
  ['band_background', 'Band background'],
  ['band_story', 'Album background'],
  ['band_history', 'Band history'],
];

// Full reading view for one review — nothing clipped.
export default function ReviewDetailModal({ review, onClose }) {
  if (!review) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,24,21,0.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        className="w-full max-w-2xl max-h-[86vh] overflow-y-auto p-7"
        style={{ background: '#faf8f2', border: '1px solid #e0d8c8', boxShadow: '0 16px 50px rgba(120,100,80,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-lg font-bold font-playfair" style={{ color: '#bf7a35' }}>
              {review.rating ? `${(review.rating * 2).toFixed(1)}/10` : '—'}
            </span>
            {review.title && (
              <h2 className="font-playfair italic text-2xl mt-1" style={{ color: '#1a1815' }}>"{review.title}"</h2>
            )}
          </div>
          <button onClick={onClose} style={{ color: '#6b6358' }}><X className="w-5 h-5" /></button>
        </div>

        <p className="mt-5 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#3d3831' }}>
          {review.content}
        </p>

        {SECTIONS.some(([k]) => review[k]) && (
          <div className="mt-6 pt-5 space-y-4" style={{ borderTop: '1px solid #e6ddc9' }}>
            {SECTIONS.filter(([k]) => review[k]).map(([k, label]) => (
              <div key={k}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: '#bf7a35' }}>{label}</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#5a534a' }}>{review[k]}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-7 pt-4 text-xs" style={{ borderTop: '1px solid #e6ddc9', color: '#8a7e6f' }}>
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#e6ddc9' }}>
              <User className="w-3 h-3" style={{ color: '#6b6358' }} />
            </div>
            {review.reviewer_name || 'Anonymous'}
            {review.created_date && <> · {formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}</>}
          </span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {review.likes_count || 0}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}