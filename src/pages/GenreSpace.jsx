import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GENRES, genreThemes } from '@/lib/genreConfig';
import { ArrowLeft, Star, Plus, X, MessageSquare, Calendar } from 'lucide-react';
import StarRating from '@/components/StarRating';

// Per-genre visual configs — background, accent colors, fonts
const GENRE_VISUALS = {
  rock: {
    bg: 'radial-gradient(ellipse at 30% 20%, #1a0a0a 0%, #0d0505 60%, #080303 100%)',
    accent: '#e63946',
    accentGlow: 'rgba(230,57,70,0.4)',
    text: '#f5e0e0',
    muted: '#9a7070',
    cardBg: 'rgba(40,15,15,0.8)',
    cardBorder: 'rgba(230,57,70,0.2)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' },
    tagline: 'Underground · Raw · Alive',
  },
  pop: {
    bg: 'radial-gradient(ellipse at 60% 10%, #1a0a1a 0%, #0e0510 60%, #060308 100%)',
    accent: '#ec407a',
    accentGlow: 'rgba(236,64,122,0.4)',
    text: '#fce4ec',
    muted: '#a07080',
    cardBg: 'rgba(40,10,30,0.8)',
    cardBorder: 'rgba(236,64,122,0.2)',
    headerStyle: { fontWeight: 700, letterSpacing: '-0.01em' },
    tagline: 'Clean · Bright · Now',
  },
  classical: {
    bg: 'radial-gradient(ellipse at 50% 0%, #120e06 0%, #0a0802 60%, #050401 100%)',
    accent: '#d4a017',
    accentGlow: 'rgba(212,160,23,0.35)',
    text: '#f2ead8',
    muted: '#8a7a60',
    cardBg: 'rgba(30,22,8,0.85)',
    cardBorder: 'rgba(212,160,23,0.18)',
    headerStyle: { fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: '0.02em' },
    tagline: 'Timeless · Precise · Profound',
  },
  metal: {
    bg: 'radial-gradient(ellipse at 50% 0%, #0a0a0a 0%, #050505 100%)',
    accent: '#cc1111',
    accentGlow: 'rgba(204,17,17,0.45)',
    text: '#e0e0e0',
    muted: '#666',
    cardBg: 'rgba(15,10,10,0.9)',
    cardBorder: 'rgba(204,17,17,0.25)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase' },
    tagline: 'Heavy · Dark · Relentless',
  },
  jazz: {
    bg: 'radial-gradient(ellipse at 40% 10%, #0a1020 0%, #070b18 60%, #040810 100%)',
    accent: '#d4a017',
    accentGlow: 'rgba(212,160,23,0.35)',
    text: '#d4c5a9',
    muted: '#8a7a66',
    cardBg: 'rgba(15,20,40,0.85)',
    cardBorder: 'rgba(212,160,23,0.18)',
    headerStyle: { fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.03em' },
    tagline: 'Improvised · Intimate · Late Night',
  },
  blues: {
    bg: 'radial-gradient(ellipse at 30% 20%, #08101a 0%, #050c14 60%, #020608 100%)',
    accent: '#5c8ab5',
    accentGlow: 'rgba(92,138,181,0.4)',
    text: '#b0c8d8',
    muted: '#507080',
    cardBg: 'rgba(10,20,35,0.85)',
    cardBorder: 'rgba(92,138,181,0.2)',
    headerStyle: { fontWeight: 600, letterSpacing: '0.01em' },
    tagline: 'Slow · Honest · Deep',
  },
  r_and_b: {
    bg: 'radial-gradient(ellipse at 50% 0%, #140820 0%, #0c0518 60%, #060210 100%)',
    accent: '#b47fff',
    accentGlow: 'rgba(180,127,255,0.4)',
    text: '#e0d0f0',
    muted: '#9070b0',
    cardBg: 'rgba(25,10,45,0.85)',
    cardBorder: 'rgba(180,127,255,0.2)',
    headerStyle: { fontWeight: 500, letterSpacing: '0.01em' },
    tagline: 'Smooth · Soulful · Night',
  },
  hardcore: {
    bg: '#000000',
    accent: '#ffffff',
    accentGlow: 'rgba(255,255,255,0.25)',
    text: '#f0f0f0',
    muted: '#606060',
    cardBg: 'rgba(10,10,10,0.95)',
    cardBorder: 'rgba(255,255,255,0.12)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.06em', textTransform: 'uppercase' },
    tagline: 'Fast · Loud · No Filler',
  },
  country: {
    bg: 'radial-gradient(ellipse at 50% 0%, #100c04 0%, #0a0802 60%, #060500 100%)',
    accent: '#a0522d',
    accentGlow: 'rgba(160,82,45,0.4)',
    text: '#f5e8cc',
    muted: '#8a7a5a',
    cardBg: 'rgba(28,20,8,0.85)',
    cardBorder: 'rgba(160,82,45,0.2)',
    headerStyle: { fontWeight: 600 },
    tagline: 'Warm · Story-driven · Real',
  },
  hip_hop: {
    bg: 'radial-gradient(ellipse at 50% 0%, #0c0c0c 0%, #070707 100%)',
    accent: '#f5c518',
    accentGlow: 'rgba(245,197,24,0.4)',
    text: '#f0f0f0',
    muted: '#888',
    cardBg: 'rgba(18,18,18,0.92)',
    cardBorder: 'rgba(245,197,24,0.2)',
    headerStyle: { fontWeight: 800, letterSpacing: '-0.03em' },
    tagline: 'Culture · Rhythm · Truth',
  },
  indie: {
    bg: 'radial-gradient(ellipse at 40% 10%, #0a0e08 0%, #070a05 60%, #040602 100%)',
    accent: '#7a8a6a',
    accentGlow: 'rgba(122,138,106,0.4)',
    text: '#dde8cc',
    muted: '#7a8a6a',
    cardBg: 'rgba(15,20,10,0.85)',
    cardBorder: 'rgba(122,138,106,0.2)',
    headerStyle: { fontWeight: 400, letterSpacing: '0.01em' },
    tagline: 'Curious · Unfiltered · Yours',
  },
  grunge: {
    bg: 'radial-gradient(ellipse at 30% 20%, #100c06 0%, #0a0804 60%, #060502 100%)',
    accent: '#8b7355',
    accentGlow: 'rgba(139,115,85,0.4)',
    text: '#c8b89a',
    muted: '#80706a',
    cardBg: 'rgba(22,18,10,0.88)',
    cardBorder: 'rgba(139,115,85,0.2)',
    headerStyle: { fontWeight: 600, letterSpacing: '-0.01em' },
    tagline: 'Distorted · Raw · Unapologetic',
  },
  electronic: {
    bg: 'radial-gradient(ellipse at 50% 0%, #020d1f 0%, #010810 60%, #000408 100%)',
    accent: '#4080ff',
    accentGlow: 'rgba(64,128,255,0.45)',
    text: '#c8d8f0',
    muted: '#5080a0',
    cardBg: 'rgba(5,15,40,0.85)',
    cardBorder: 'rgba(64,128,255,0.2)',
    headerStyle: { fontWeight: 500, letterSpacing: '0.04em' },
    tagline: 'Synthetic · Future · Dance',
  },
};

function ReviewForm({ genreId, v, onClose, onSubmit, isPending }) {
  const [data, setData] = useState({ rating: 0, title: '', content: '', album_title: '', album_artist: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-8"
      style={{ background: v.cardBg, border: `1px solid ${v.accent}44`, boxShadow: `0 0 30px ${v.accentGlow}` }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-lg" style={{ color: v.text }}>Write a Review</h3>
        <button onClick={onClose} style={{ color: v.muted }}><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Album</label>
            <input
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${v.accent}30`, color: v.text }}
              placeholder="Album title"
              value={data.album_title}
              onChange={e => setData({ ...data, album_title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Artist</label>
            <input
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${v.accent}30`, color: v.text }}
              placeholder="Artist name"
              value={data.album_artist}
              onChange={e => setData({ ...data, album_artist: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: v.muted }}>Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setData({ ...data, rating: n })}
                style={{ color: n <= data.rating ? v.accent : v.muted, filter: n <= data.rating ? `drop-shadow(0 0 6px ${v.accent})` : 'none' }}
              >
                <Star className="w-6 h-6" fill={n <= data.rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Review Title</label>
          <input
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${v.accent}30`, color: v.text }}
            placeholder="Sum it up…"
            value={data.title}
            onChange={e => setData({ ...data, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Your Thoughts *</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${v.accent}30`, color: v.text }}
            rows={4}
            placeholder="Share your honest take…"
            value={data.content}
            onChange={e => setData({ ...data, content: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!data.rating || isPending}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: v.accent,
              color: '#000',
              opacity: (!data.rating || isPending) ? 0.5 : 1,
              boxShadow: `0 0 16px ${v.accentGlow}`,
            }}
          >
            {isPending ? 'Posting…' : 'Post Review'}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm" style={{ color: v.muted, border: `1px solid ${v.muted}40` }}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function ReviewItem({ review, v }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5"
      style={{ background: v.cardBg, border: `1px solid ${v.cardBorder}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: v.text }}>{review.album_title} <span style={{ color: v.muted }}>— {review.album_artist}</span></p>
          {review.title && <p className="text-xs mt-0.5 italic" style={{ color: v.accent }}>"{review.title}"</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          {[1,2,3,4,5].map(n => (
            <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= review.rating ? v.accent : v.muted }} fill={n <= review.rating ? 'currentColor' : 'none'} />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: v.muted }}>{review.content}</p>
      <p className="text-xs mt-3" style={{ color: v.muted + '80' }}>{review.reviewer_name || 'Anonymous'}</p>
    </motion.div>
  );
}

export default function GenreSpace() {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const genre = GENRES.find(g => g.id === genreId);
  const v = GENRE_VISUALS[genreId] || GENRE_VISUALS.electronic;

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch reviews by checking album_artist/title — actually store genre on review via album
  // We'll query all reviews and filter client-side by the genre mapping
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ['reviews-for-genre', genreId],
    queryFn: async () => {
      // Get albums of this genre first
      const entityGenre = genre?.entityGenre;
      if (!entityGenre) return [];
      const albums = await base44.entities.Album.filter({ genre: entityGenre }, '-created_date', 200);
      if (!albums.length) return [];
      const albumIds = new Set(albums.map(a => a.id));
      const allR = await base44.entities.Review.list('-created_date', 200);
      return allR.filter(r => albumIds.has(r.album_id));
    },
    enabled: !!genre,
  });

  const createReview = useMutation({
    mutationFn: async (data) => {
      // Create a stub album entry for this genre if needed, or just store review without album_id link
      let albumId = 'standalone';
      // Try to find existing album
      const existing = await base44.entities.Album.filter({ title: data.album_title, artist: data.album_artist });
      if (existing.length > 0) {
        albumId = existing[0].id;
        const a = existing[0];
        const newCount = (a.review_count || 0) + 1;
        const totalRating = (a.avg_rating || 0) * (a.review_count || 0) + data.rating;
        await base44.entities.Album.update(albumId, {
          review_count: newCount,
          avg_rating: Math.round((totalRating / newCount) * 10) / 10,
        });
      } else {
        // Create album stub
        const newAlbum = await base44.entities.Album.create({
          title: data.album_title,
          artist: data.album_artist,
          genre: genre?.entityGenre || 'other',
          avg_rating: data.rating,
          review_count: 1,
        });
        albumId = newAlbum.id;
      }
      await base44.entities.Review.create({
        album_id: albumId,
        album_title: data.album_title,
        album_artist: data.album_artist,
        rating: data.rating,
        title: data.title,
        content: data.content,
        reviewer_name: currentUser?.full_name || 'Anonymous',
        likes_count: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-for-genre', genreId] });
      setShowForm(false);
    },
  });

  if (!genre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#050709', color: '#aaa' }}>
        <p>Genre not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 underline">Go home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: v.bg }}>
      {/* Header bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: `${v.accent}20` }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: v.muted }}
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: v.accent, textShadow: `0 0 12px ${v.accent}` }}>
            {genre.label}
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: v.accent, color: '#000', boxShadow: `0 0 14px ${v.accentGlow}` }}
          >
            <Plus className="w-3.5 h-3.5" /> Review
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        {/* Genre hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1
            className="leading-none mb-3"
            style={{
              ...v.headerStyle,
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              color: v.accent,
              textShadow: `0 0 40px ${v.accentGlow}, 0 0 80px ${v.accentGlow}`,
            }}
          >
            {genre.label}
          </h1>
          <p className="text-sm uppercase tracking-widest" style={{ color: v.muted }}>{v.tagline}</p>
          <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: v.muted }}>{genre.desc}</p>
          <div className="mt-4 h-px mx-auto max-w-xs" style={{ background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)` }} />
        </motion.div>

        {/* Review form */}
        <AnimatePresence>
          {showForm && (
            <ReviewForm
              genreId={genreId}
              v={v}
              onClose={() => setShowForm(false)}
              onSubmit={(data) => createReview.mutate(data)}
              isPending={createReview.isPending}
            />
          )}
        </AnimatePresence>

        {/* Reviews list */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest font-bold" style={{ color: v.muted }}>
              Community Reviews
              {allReviews.length > 0 && <span className="ml-2" style={{ color: v.accent }}>({allReviews.length})</span>}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-xl h-28 animate-pulse" style={{ background: v.cardBg }} />
              ))}
            </div>
          ) : allReviews.length > 0 ? (
            <div className="space-y-4">
              {allReviews.map(review => (
                <ReviewItem key={review.id} review={review} v={v} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl"
              style={{ border: `1px dashed ${v.accent}30` }}
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: v.muted }} />
              <p className="text-sm" style={{ color: v.muted }}>No reviews yet for {genre.label}.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm font-semibold underline"
                style={{ color: v.accent }}
              >
                Be the first
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}