import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GENRES } from '@/lib/genreConfig';
import { ArrowLeft } from 'lucide-react';
import MusicSlider from '@/components/MusicSlider';
import AddMusicModal from '@/components/AddMusicModal';
import MusicItemDetail from '@/components/MusicItemDetail';
import GenreRankings from '@/components/GenreRankings';
import GenreHeroMark from '@/components/genre-dashboard/GenreHeroMark';
import { storeCoverImage } from '@/lib/storeCoverImage';
import { fetchCoverCascade } from '@/components/TrackList';

// Per-genre visual configs
const GENRE_VISUALS = {
  rock: {
    bg: 'radial-gradient(ellipse at 30% 20%, #1a0a0a 0%, #0d0505 60%, #080303 100%)',
    accent: '#e63946', accentGlow: 'rgba(230,57,70,0.4)',
    text: '#f5e0e0', muted: '#9a7070',
    cardBg: 'rgba(40,15,15,0.8)', cardBorder: 'rgba(230,57,70,0.2)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' },
    tagline: 'Underground · Raw · Alive',
  },
  pop: {
    bg: 'radial-gradient(ellipse at 60% 10%, #1a0a1a 0%, #0e0510 60%, #060308 100%)',
    accent: '#ec407a', accentGlow: 'rgba(236,64,122,0.4)',
    text: '#fce4ec', muted: '#a07080',
    cardBg: 'rgba(40,10,30,0.8)', cardBorder: 'rgba(236,64,122,0.2)',
    headerStyle: { fontWeight: 700, letterSpacing: '-0.01em' },
    tagline: 'Clean · Bright · Now',
  },
  classical: {
    bg: 'radial-gradient(ellipse at 50% 0%, #120e06 0%, #0a0802 60%, #050401 100%)',
    accent: '#d4a017', accentGlow: 'rgba(212,160,23,0.35)',
    text: '#f2ead8', muted: '#8a7a60',
    cardBg: 'rgba(30,22,8,0.85)', cardBorder: 'rgba(212,160,23,0.18)',
    headerStyle: { fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: '0.02em' },
    tagline: 'Timeless · Precise · Profound',
  },
  metal: {
    bg: 'radial-gradient(ellipse at 50% 0%, #0a0a0a 0%, #050505 100%)',
    accent: '#cc1111', accentGlow: 'rgba(204,17,17,0.45)',
    text: '#e0e0e0', muted: '#666',
    cardBg: 'rgba(15,10,10,0.9)', cardBorder: 'rgba(204,17,17,0.25)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase' },
    tagline: 'Heavy · Dark · Relentless',
  },
  jazz: {
    bg: 'radial-gradient(ellipse at 40% 10%, #0a1020 0%, #070b18 60%, #040810 100%)',
    accent: '#d4a017', accentGlow: 'rgba(212,160,23,0.35)',
    text: '#d4c5a9', muted: '#8a7a66',
    cardBg: 'rgba(15,20,40,0.85)', cardBorder: 'rgba(212,160,23,0.18)',
    headerStyle: { fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.03em' },
    tagline: 'Improvised · Intimate · Late Night',
  },
  blues: {
    bg: 'radial-gradient(ellipse at 30% 20%, #08101a 0%, #050c14 60%, #020608 100%)',
    accent: '#5c8ab5', accentGlow: 'rgba(92,138,181,0.4)',
    text: '#b0c8d8', muted: '#507080',
    cardBg: 'rgba(10,20,35,0.85)', cardBorder: 'rgba(92,138,181,0.2)',
    headerStyle: { fontWeight: 600, letterSpacing: '0.01em' },
    tagline: 'Slow · Honest · Deep',
  },
  r_and_b: {
    bg: 'radial-gradient(ellipse at 50% 0%, #140820 0%, #0c0518 60%, #060210 100%)',
    accent: '#b47fff', accentGlow: 'rgba(180,127,255,0.4)',
    text: '#e0d0f0', muted: '#9070b0',
    cardBg: 'rgba(25,10,45,0.85)', cardBorder: 'rgba(180,127,255,0.2)',
    headerStyle: { fontWeight: 500, letterSpacing: '0.01em' },
    tagline: 'Smooth · Soulful · Night',
  },
  core: {
    bg: '#000000',
    accent: '#ffffff', accentGlow: 'rgba(255,255,255,0.25)',
    text: '#f0f0f0', muted: '#606060',
    cardBg: 'rgba(10,10,10,0.95)', cardBorder: 'rgba(255,255,255,0.12)',
    headerStyle: { fontWeight: 900, letterSpacing: '-0.06em', textTransform: 'uppercase' },
    tagline: 'Punk · Extreme Core',
  },
  country: {
    bg: 'radial-gradient(ellipse at 50% 0%, #100c04 0%, #0a0802 60%, #060500 100%)',
    accent: '#a0522d', accentGlow: 'rgba(160,82,45,0.4)',
    text: '#f5e8cc', muted: '#8a7a5a',
    cardBg: 'rgba(28,20,8,0.85)', cardBorder: 'rgba(160,82,45,0.2)',
    headerStyle: { fontWeight: 600 },
    tagline: 'Warm · Story-driven · Real',
  },
  hip_hop: {
    bg: 'radial-gradient(ellipse at 50% 0%, #0c0c0c 0%, #070707 100%)',
    accent: '#f5c518', accentGlow: 'rgba(245,197,24,0.4)',
    text: '#f0f0f0', muted: '#888',
    cardBg: 'rgba(18,18,18,0.92)', cardBorder: 'rgba(245,197,24,0.2)',
    headerStyle: { fontWeight: 800, letterSpacing: '-0.03em' },
    tagline: 'Culture · Rhythm · Truth',
  },
  indie: {
    bg: 'radial-gradient(ellipse at 40% 10%, #0a0e08 0%, #070a05 60%, #040602 100%)',
    accent: '#7a8a6a', accentGlow: 'rgba(122,138,106,0.4)',
    text: '#dde8cc', muted: '#7a8a6a',
    cardBg: 'rgba(15,20,10,0.85)', cardBorder: 'rgba(122,138,106,0.2)',
    headerStyle: { fontWeight: 400, letterSpacing: '0.01em' },
    tagline: 'Curious · Unfiltered · Yours',
  },
  grunge: {
    bg: 'radial-gradient(ellipse at 30% 20%, #100c06 0%, #0a0804 60%, #060502 100%)',
    accent: '#8b7355', accentGlow: 'rgba(139,115,85,0.4)',
    text: '#c8b89a', muted: '#80706a',
    cardBg: 'rgba(22,18,10,0.88)', cardBorder: 'rgba(139,115,85,0.2)',
    headerStyle: { fontWeight: 600, letterSpacing: '-0.01em' },
    tagline: 'Distorted · Raw · Unapologetic',
  },
  electronic: {
    bg: 'radial-gradient(ellipse at 50% 0%, #020d1f 0%, #010810 60%, #000408 100%)',
    accent: '#4080ff', accentGlow: 'rgba(64,128,255,0.45)',
    text: '#c8d8f0', muted: '#5080a0',
    cardBg: 'rgba(5,15,40,0.85)', cardBorder: 'rgba(64,128,255,0.2)',
    headerStyle: { fontWeight: 500, letterSpacing: '0.04em' },
    tagline: 'Synthetic · Future · Dance',
  },
  funk: {
    bg: 'radial-gradient(ellipse at 50% 0%, #1f1a02 0%, #120e01 60%, #0a0700 100%)',
    accent: '#fbbf24', accentGlow: 'rgba(251,191,36,0.4)',
    text: '#fde68a', muted: '#a08a50',
    cardBg: 'rgba(45,38,8,0.85)', cardBorder: 'rgba(251,191,36,0.2)',
    headerStyle: { fontWeight: 700, letterSpacing: '-0.01em' },
    tagline: 'Groovy · Loose · Alive',
  },
  acg: {
    bg: 'radial-gradient(ellipse at 50% 0%, #021f1f 0%, #011212 60%, #000a0a 100%)',
    accent: '#22d3ee', accentGlow: 'rgba(34,211,238,0.4)',
    text: '#a5f3fc', muted: '#4a9098',
    cardBg: 'rgba(8,40,45,0.85)', cardBorder: 'rgba(34,211,238,0.2)',
    headerStyle: { fontWeight: 600, letterSpacing: '0.01em' },
    tagline: 'Nostalgic · Epic · Playful',
  },
  cinematic: {
    bg: 'radial-gradient(ellipse at 50% 0%, #1a1408 0%, #100d05 60%, #080602 100%)',
    accent: '#d4a24c', accentGlow: 'rgba(212,162,76,0.4)',
    text: '#f0dcb0', muted: '#8a7550',
    cardBg: 'rgba(35,28,12,0.85)', cardBorder: 'rgba(212,162,76,0.2)',
    headerStyle: { fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: '0.01em' },
    tagline: 'Sweeping · Dramatic · Immersive',
  },
};

export default function GenreSpace() {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [addModal, setAddModal] = useState(null); // 'album' | 'single' | null
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    // Increment click count for popularity tracking
    base44.entities.Album.update(item.id, { click_count: (item.click_count || 0) + 1 });
  };

  const genre = GENRES.find(g => g.id === genreId);
  const v = GENRE_VISUALS[genreId] || GENRE_VISUALS.electronic;
  const entityGenre = genre?.entityGenre;

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['genre-albums', genreId],
    queryFn: async () => {
      if (!entityGenre) return [];
      return base44.entities.Album.filter({ genre: entityGenre }, '-created_date', 200);
    },
    enabled: !!entityGenre,
  });

  const albums = allItems.filter(i => !i.type || i.type === 'album');
  const singles = allItems.filter(i => i.type === 'single');

  const [duplicateError, setDuplicateError] = useState(null);

  // Singles have no automatic tracklist (that only runs for albums when opened),
  // so cascade through all 4 databases for a cover right at creation time when
  // the user didn't upload one — same guarantee albums get for tracklists.
  const fetchSingleCover = async (title, artist, genre) => {
    const result = await fetchCoverCascade(title, artist, genre);
    return result?.coverUrl ? await storeCoverImage(result.coverUrl) : null;
  };

  const addItem = useMutation({
    mutationFn: async (data) => {
      // Check for duplicate (same title + artist, case-insensitive)
      const exists = allItems.some(
        item =>
          item.title?.toLowerCase() === data.title?.toLowerCase() &&
          item.artist?.toLowerCase() === data.artist?.toLowerCase()
      );
      if (exists) throw new Error(`"${data.title}" by ${data.artist} is already in this genre.`);

      let cover_url = data.cover_url;
      if (data.type === 'single' && !cover_url) {
        cover_url = await fetchSingleCover(data.title, data.artist, entityGenre) || '';
      }

      return base44.entities.Album.create({ ...data, cover_url, genre: entityGenre || 'other', avg_rating: 0, review_count: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genre-albums', genreId] });
      setDuplicateError(null);
      setAddModal(null);
    },
    onError: (err) => setDuplicateError(err.message),
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
      {/* Top bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.5)', borderBottom: `1px solid ${v.accent}12` }}>
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: v.muted }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </button>
          <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: `${v.muted}60` }}>
            {genre.label} Space
          </span>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-14 pb-24">
        {/* Genre hero — editorial, asymmetric */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
          className="mb-20 relative"
        >
          <GenreHeroMark genreId={genreId} accent={v.accent} />

          {/* Ghost large number / letter behind */}
          <div
            className="absolute -top-8 -left-4 select-none pointer-events-none font-playfair"
            style={{ fontSize: 'clamp(8rem, 22vw, 18rem)', color: `${v.accent}06`, letterSpacing: '-0.06em', lineHeight: 1 }}
          >
            {genre.label.slice(0, 2)}
          </div>

          <div className="relative">
            {/* Small label above */}
            <p className="text-xs uppercase tracking-[0.28em] mb-4 font-semibold" style={{ color: v.text }}>
              {v.tagline}
            </p>

            {/* Main title — large serif, left-aligned */}
            <h1
              className="font-playfair leading-none mb-6"
              style={{
                ...v.headerStyle,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: v.headerStyle?.fontWeight || 700,
                fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
                color: v.accent,
                textShadow: `0 0 60px ${v.accentGlow}, 0 0 120px ${v.accentGlow}`,
                letterSpacing: '-0.03em',
              }}
            >
              {genre.label}
            </h1>

            {/* Description — right-offset, constrained */}
            <div className="max-w-sm ml-auto">
              <p className="text-base leading-relaxed" style={{ color: v.text }}>{genre.desc}</p>
            </div>

            {/* Thin accent rule */}
            <div className="mt-10 flex items-center gap-5">
              <div className="h-px flex-1" style={{ background: `${v.accent}20` }} />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: v.muted }}>{genre.label}</span>
              <div className="h-px w-8" style={{ background: `${v.accent}20` }} />
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-8 mt-8">
            {[0,1].map(s => (
              <div key={s}>
                <div className="h-4 w-24 rounded mb-4 animate-pulse" style={{ background: `${v.accent}20` }} />
                <div className="flex gap-4">
                  {[0,1,2,3].map(i => <div key={i} className="w-40 h-52 rounded-xl animate-pulse shrink-0" style={{ background: `${v.accent}12` }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-2">
            {/* Rankings */}
            <GenreRankings items={allItems} v={v} />

            <div className="h-px my-6" style={{ background: `${v.accent}18` }} />

            {/* Albums slider */}
            <MusicSlider
              items={albums}
              v={v}
              label="Albums"
              onItemClick={handleItemClick}
              onAddClick={() => setAddModal('album')}
            />

            <div className="h-px my-6" style={{ background: `${v.accent}18` }} />

            {/* Singles slider */}
            <MusicSlider
              items={singles}
              v={v}
              label="Singles"
              onItemClick={handleItemClick}
              onAddClick={() => setAddModal('single')}
            />
          </div>
        )}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {addModal && (
          <AddMusicModal
            v={v}
            type={addModal}
            onClose={() => { setAddModal(null); setDuplicateError(null); }}
            onSubmit={(data) => addItem.mutate(data)}
            isPending={addItem.isPending}
            errorMessage={duplicateError}
          />
        )}
      </AnimatePresence>

      {/* Item detail / reviews modal */}
      <AnimatePresence>
        {selectedItem && (
          <MusicItemDetail
            item={selectedItem}
            v={v}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}