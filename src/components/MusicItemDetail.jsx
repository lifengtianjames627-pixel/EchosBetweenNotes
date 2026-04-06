import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Star, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';

function StarPicker({ rating, onRate, accent, muted }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onRate(n)}>
          <Star
            className="w-5 h-5 transition-all"
            style={{ color: n <= rating ? accent : muted, filter: n <= rating ? `drop-shadow(0 0 5px ${accent})` : 'none' }}
            fill={n <= rating ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

function CommentSection({ reviewId, v, currentUser }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', reviewId],
    queryFn: () => base44.entities.Comment.filter({ review_id: reviewId }, 'created_date', 50),
    enabled: open,
  });

  const addComment = useMutation({
    mutationFn: (content) => base44.entities.Comment.create({
      review_id: reviewId,
      content,
      author_name: currentUser?.full_name || 'Anonymous',
      author_email: currentUser?.email || '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', reviewId] });
      setText('');
    },
  });

  return (
    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${v.cardBorder}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs"
        style={{ color: v.muted }}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {open ? 'Hide' : 'Comments'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${v.accent}25`, color: v.accent }}>
                    {(c.author_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold mr-1.5" style={{ color: v.text }}>{c.author_name || 'Anonymous'}</span>
                    <span className="text-xs" style={{ color: v.muted }}>{c.content}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Comment input */}
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
                placeholder="Add a comment…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && text.trim()) addComment.mutate(text.trim()); }}
              />
              <button
                disabled={!text.trim() || addComment.isPending}
                onClick={() => text.trim() && addComment.mutate(text.trim())}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: `${v.accent}25`, color: v.accent }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewForm({ albumId, album, v, currentUser, onSuccess }) {
  const [data, setData] = useState({ rating: 0, title: '', content: '', band_style: '', band_background: '', band_history: '', band_story: '' });
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (d) => {
      await base44.entities.Review.create({
        album_id: albumId,
        album_title: album.title,
        album_artist: album.artist,
        album_cover_url: album.cover_url || '',
        rating: d.rating,
        title: d.title,
        content: d.content,
        reviewer_name: currentUser?.full_name || 'Anonymous',
        likes_count: 0,
        band_style: d.band_style,
        band_background: d.band_background,
        band_history: d.band_history,
        band_story: d.band_story,
      });
      const newCount = (album.review_count || 0) + 1;
      const totalRating = (album.avg_rating || 0) * (album.review_count || 0) + d.rating;
      await base44.entities.Album.update(albumId, {
        review_count: newCount,
        avg_rating: Math.round((totalRating / newCount) * 10) / 10,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-reviews', albumId] });
      queryClient.invalidateQueries({ queryKey: ['genre-albums'] });
      setData({ rating: 0, title: '', content: '' });
      onSuccess?.();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); createReview.mutate(data); }} className="space-y-3 mt-4 rounded-xl p-4" style={{ background: `${v.accent}0d`, border: `1px solid ${v.accent}25` }}>
      <p className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>Write a Review</p>
      <StarPicker rating={data.rating} onRate={r => setData({ ...data, rating: r })} accent={v.accent} muted={v.muted} />
      <input
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
        placeholder="Review title (optional)"
        value={data.title}
        onChange={e => setData({ ...data, title: e.target.value })}
      />
      <textarea
        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
        rows={3}
        placeholder="Your honest take…"
        value={data.content}
        onChange={e => setData({ ...data, content: e.target.value })}
        required
      />

      {/* Band info section */}
      <div className="pt-3 mt-1" style={{ borderTop: `1px solid ${v.accent}18` }}>
        <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: v.muted }}>Band / Artist Info <span className="normal-case font-normal opacity-60">(optional)</span></p>

        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: v.muted }}>Specific Style / Sub-genre</label>
            <input
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
              placeholder="e.g. Thrash Metal, Dream Pop, Bebop…"
              value={data.band_style}
              onChange={e => setData({ ...data, band_style: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: v.muted }}>Band Background</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
              rows={2}
              placeholder="Who are they? Where are they from?"
              value={data.band_background}
              onChange={e => setData({ ...data, band_background: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: v.muted }}>Band History</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
              rows={2}
              placeholder="Formation, lineup changes, key milestones…"
              value={data.band_history}
              onChange={e => setData({ ...data, band_history: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: v.muted }}>Background Story</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${v.accent}25`, color: v.text }}
              rows={2}
              placeholder="The story behind the band — origins, inspiration, lore…"
              value={data.band_story}
              onChange={e => setData({ ...data, band_story: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!data.rating || createReview.isPending}
        className="px-5 py-2 rounded-full text-sm font-semibold"
        style={{ background: v.accent, color: '#000', opacity: (!data.rating || createReview.isPending) ? 0.5 : 1, boxShadow: `0 0 14px ${v.accentGlow}` }}
      >
        {createReview.isPending ? 'Posting…' : 'Post Review'}
      </button>
    </form>
  );
}

export default function MusicItemDetail({ item, v, onClose }) {
  const [showForm, setShowForm] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['item-reviews', item.id],
    queryFn: () => base44.entities.Review.filter({ album_id: item.id }, '-created_date', 100),
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: v.cardBg, border: `1px solid ${v.accent}30`, boxShadow: `0 0 60px ${v.accentGlow}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex gap-4 p-5 pb-4 sticky top-0 z-10 backdrop-blur-lg" style={{ background: v.cardBg }}>
          <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden" style={{ background: `${v.accent}15` }}>
            {item.cover_url ? (
              <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-widest" style={{ color: v.accent }}>{item.type || 'album'}</span>
                <h2 className="text-lg font-bold leading-tight mt-0.5" style={{ color: v.text, ...v.headerStyle }}>{item.title}</h2>
                <p className="text-sm" style={{ color: v.muted }}>{item.artist} {item.release_year && `· ${item.release_year}`}</p>
              </div>
              <button onClick={onClose} className="shrink-0 mt-1" style={{ color: v.muted }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= Math.round(avgRating) ? v.accent : v.muted }} fill={n <= Math.round(avgRating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: v.accent }}>{avgRating}</span>
                <span className="text-xs" style={{ color: v.muted }}>({reviews.length})</span>
              </div>
            )}
          </div>
        </div>

        {item.description && (
          <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: v.muted }}>{item.description}</p>
        )}

        <div className="px-5 pb-6">
          {/* Reviews */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>
              Reviews {reviews.length > 0 && <span style={{ color: v.accent }}>({reviews.length})</span>}
            </p>
            <button
              onClick={() => setShowForm(f => !f)}
              className="text-xs px-3 py-1 rounded-full"
              style={{ border: `1px solid ${v.accent}40`, color: v.accent }}
            >
              {showForm ? 'Cancel' : '+ Review'}
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <ReviewForm albumId={item.id} album={item} v={v} currentUser={currentUser} onSuccess={() => setShowForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="space-y-3 mt-4">
              {[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: `${v.accent}10` }} />)}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 mt-4">
              {reviews.map(review => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4"
                  style={{ background: `${v.accent}0a`, border: `1px solid ${v.cardBorder}` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-sm font-semibold" style={{ color: v.text }}>{review.reviewer_name || 'Anonymous'}</span>
                      {review.title && <span className="text-xs ml-2 italic" style={{ color: v.accent }}>"{review.title}"</span>}
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className="w-3 h-3" style={{ color: n <= review.rating ? v.accent : v.muted }} fill={n <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: v.muted }}>{review.content}</p>

                  {/* Band info display */}
                  {(review.band_style || review.band_background || review.band_history || review.band_story) && (
                    <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${v.accent}15` }}>
                      {review.band_style && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full" style={{ background: `${v.accent}20`, color: v.accent }}>
                            {review.band_style}
                          </span>
                        </div>
                      )}
                      {review.band_background && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: v.accent }}>Background</p>
                          <p className="text-xs leading-relaxed" style={{ color: v.muted }}>{review.band_background}</p>
                        </div>
                      )}
                      {review.band_history && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: v.accent }}>History</p>
                          <p className="text-xs leading-relaxed" style={{ color: v.muted }}>{review.band_history}</p>
                        </div>
                      )}
                      {review.band_story && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: v.accent }}>Story</p>
                          <p className="text-xs leading-relaxed" style={{ color: v.muted }}>{review.band_story}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <CommentSection reviewId={review.id} v={v} currentUser={currentUser} />
                </motion.div>
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="text-center py-10" style={{ color: v.muted }}>
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}