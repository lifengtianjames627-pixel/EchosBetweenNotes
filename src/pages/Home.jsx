import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Users, ArrowRight, MessageSquare } from 'lucide-react';
import { GENRES } from '@/lib/genreConfig';

const GENRE_STYLES = {
  rock:       { bg: '#1c1c1c', text: '#e5e5e5', accent: '#e63946', sub: '#888', card: '#2a2a2a', border: '#363636', radius: '5px', font: { fontWeight: 800, letterSpacing: '-0.03em' } },
  pop:        { bg: '#fff5f8', text: '#1a1a1a', accent: '#ec407a', sub: '#c07090', card: '#fff', border: '#fce4ec', radius: '18px', font: { fontWeight: 500 } },
  classical:  { bg: '#faf8f3', text: '#2a2218', accent: '#8b6914', sub: '#8a7a60', card: '#fffef9', border: '#e5d9c0', radius: '3px', font: { fontFamily: 'Georgia,serif', fontWeight: 500 } },
  metal:      { bg: '#080808', text: '#e0e0e0', accent: '#cc1111', sub: '#666', card: '#101010', border: '#252525', radius: '1px', font: { fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' } },
  jazz:       { bg: '#0e1a2e', text: '#d4c5a9', accent: '#d4a017', sub: '#8a7a66', card: 'rgba(255,255,255,0.05)', border: 'rgba(212,197,169,0.15)', radius: '8px', font: { fontFamily: 'Georgia,serif' } },
  blues:      { bg: '#1a1f2e', text: '#b0bec5', accent: '#5c8ab5', sub: '#607080', card: '#1e2432', border: '#2a3040', radius: '6px', font: { fontWeight: 400 } },
  r_and_b:    { bg: '#1a0a2e', text: '#e0d0f0', accent: '#b47fff', sub: '#9070b0', card: 'rgba(120,60,180,0.12)', border: 'rgba(180,120,255,0.18)', radius: '12px', font: { fontWeight: 400 } },
  hardcore:   { bg: '#000', text: '#f0f0f0', accent: '#fff', sub: '#606060', card: '#0a0a0a', border: '#1e1e1e', radius: '0px', font: { fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase' } },
  country:    { bg: '#fdf6e3', text: '#3a2e1a', accent: '#a0522d', sub: '#8a7a5a', card: '#fefaf0', border: '#e8d9b8', radius: '8px', font: { fontWeight: 500 } },
  hip_hop:    { bg: '#0a0a0a', text: '#f0f0f0', accent: '#f5c518', sub: '#888', card: '#161616', border: '#2c2c2c', radius: '4px', font: { fontWeight: 800, letterSpacing: '-0.02em' } },
  indie:      { bg: '#f7f5f2', text: '#2a2a2a', accent: '#7a8a6a', sub: '#888880', card: '#fafaf7', border: '#dddad3', radius: '10px', font: { fontWeight: 400 } },
  grunge:     { bg: '#1c1810', text: '#c8b89a', accent: '#8b7355', sub: '#80706a', card: '#201c14', border: '#3a3028', radius: '4px', font: { fontWeight: 600 } },
  electronic: { bg: '#050a1a', text: '#c8d8f0', accent: '#4080ff', sub: '#5080a0', card: 'rgba(20,50,120,0.35)', border: 'rgba(80,140,255,0.22)', radius: '8px', font: { fontWeight: 500, letterSpacing: '0.04em' } },
};

const FALLBACK_STYLE = { bg: '#fff', text: '#111', accent: '#e91e8c', sub: '#888', card: '#f5f5f5', border: '#e0e0e0', radius: '10px', font: {} };

function AlbumTile({ album, s }) {
  return (
    <Link to={`/album/${album.id}`} className="group block">
      <motion.div
        whileHover={{ scale: 1.04, y: -3 }}
        transition={{ duration: 0.18 }}
        style={{ borderRadius: s.radius, overflow: 'hidden', background: s.card, border: `1px solid ${s.border}` }}
      >
        <div className="aspect-square overflow-hidden">
          {album.cover_url
            ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: `${s.accent}22` }}>🎵</div>
          }
        </div>
        <div className="p-3">
          <p className="text-sm truncate" style={{ ...s.font, color: s.text }}>{album.title}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: s.sub }}>{album.artist}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3" style={{ fill: s.accent, color: s.accent }} />
              <span className="text-xs" style={{ color: s.accent }}>{album.avg_rating?.toFixed(1) || '—'}</span>
            </div>
            <span className="flex items-center gap-0.5 text-xs" style={{ color: s.sub }}>
              <MessageSquare className="w-3 h-3" />{album.review_count || 0}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function GenreSection({ genre, albums }) {
  const s = GENRE_STYLES[genre.id] ?? FALLBACK_STYLE;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  if (albums.length === 0) return null;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ background: s.bg, borderRadius: '16px', padding: '28px 24px', marginBottom: '28px' }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{genre.icon}</span>
          <div>
            <h2 className="text-xl font-bold" style={{ ...s.font, color: s.accent }}>{genre.label}</h2>
            <p className="text-xs mt-0.5" style={{ color: s.sub }}>{genre.tagline}</p>
          </div>
        </div>
        <Link
          to={`/discover?genre=${genre.entityGenre || genre.id}`}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: s.accent }}
        >
          More <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Album grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {albums.slice(0, 10).map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <AlbumTile album={album} s={s} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default function Home() {
  const { data: allAlbums = [] } = useQuery({
    queryKey: ['albums-home'],
    queryFn: () => base44.entities.Album.list('-avg_rating', 100),
  });

  const { data: bands = [] } = useQuery({
    queryKey: ['bands-home'],
    queryFn: () => base44.entities.Band.filter({ status: 'recruiting' }, '-created_date', 4),
  });

  const genreSections = useMemo(() => {
    return GENRES.map(genre => ({
      genre,
      albums: genre.entityGenre
        ? allAlbums.filter(a => a.genre === genre.entityGenre)
        : allAlbums.filter(a => {
            if (genre.id === 'blues') return a.genre === 'r_and_b' || (a.title?.toLowerCase().includes('blues'));
            if (genre.id === 'grunge') return a.genre === 'rock' && (a.description?.toLowerCase().includes('grunge') || a.title?.toLowerCase().includes('grunge'));
            return false;
          }),
    })).filter(s => s.albums.length > 0);
  }, [allAlbums]);

  return (
    <div className="-mt-6 pt-4">
      {/* Recruiting bands strip */}
      {bands.length > 0 && (
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {bands.map(band => (
            <Link key={band.id} to={`/band/${band.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-all hover:shadow-md"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.12)' }}>
                <Users className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{band.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Looking for members</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Genre sections */}
      {genreSections.length > 0
        ? genreSections.map(({ genre, albums }) => (
            <GenreSection key={genre.id} genre={genre} albums={albums} />
          ))
        : (
          // Fallback: show all albums if no genre tagging yet
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-muted-foreground text-sm mb-3">No albums added yet.</p>
            <Link to="/discover" className="text-sm text-primary font-medium">Add the first album →</Link>
          </div>
        )
      }
    </div>
  );
}