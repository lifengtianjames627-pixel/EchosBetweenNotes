import React, { useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Star, MessageSquare, ArrowRight } from 'lucide-react';
import { GENRES } from '@/lib/genreConfig';

/* ── Album Card ── */
function AlbumCard({ album, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.38, delay: index * 0.06 }}
    >
      <Link to={`/album/${album.id}`} className="group block">
        <div className="relative rounded-xl overflow-hidden border transition-colors duration-200"
          style={{ background: 'hsl(340 25% 14%)', borderColor: 'hsl(340 20% 22%)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(330 75% 55% / 0.45)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(340 20% 22%)'}
        >
          {/* cover */}
          <div className="aspect-square overflow-hidden" style={{ background: 'hsl(340 20% 10%)' }}>
            {album.cover_url
              ? <img src={album.cover_url} alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: 'hsl(330 75% 55% / 0.3)' }}>🎵</div>
            }
          </div>

          {/* info */}
          <div className="p-3">
            <p className="text-sm font-medium truncate" style={{ color: 'hsl(340 10% 92%)' }}>{album.title}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: 'hsl(340 10% 55%)' }}>{album.artist}</p>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3" style={{ fill: 'hsl(330 75% 60%)', color: 'hsl(330 75% 60%)' }} />
                <span className="text-xs" style={{ color: 'hsl(330 60% 65%)' }}>
                  {album.avg_rating?.toFixed(1) || '—'}
                </span>
              </div>
              <span className="flex items-center gap-0.5 text-xs" style={{ color: 'hsl(340 10% 45%)' }}>
                <MessageSquare className="w-3 h-3" />
                {album.review_count || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Genre Section ── */
function GenreSection({ genre, albums }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="mb-10 rounded-2xl px-4 py-4"
      style={{ background: 'transparent' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{genre.icon}</span>

          <div>
            <h2
              className="text-base font-bold leading-none"
              style={{
                color: genre.theme?.accent || 'rgba(255,255,255,0.9)'
              }}
            >
              {genre.label}
            </h2>

            <p className="text-xs text-white/35 mt-0.5">
              {genre.tagline}
            </p>
          </div>
        </div>

        <Link
          to={`/discover`}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          More <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Album grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {albums.slice(0, 12).map((album, i) => (
          <AlbumCard key={album.id} album={album} index={i} inView={inView} />
        ))}
      </div>

      {/* Soft divider */}
      <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.section>
  );
}

/* ── Home ── */
export default function Home() {
  const { data: allAlbums = [] } = useQuery({
    queryKey: ['albums-home'],
    queryFn: () => base44.entities.Album.list('-avg_rating', 100),
  });

  const genreSections = useMemo(() => {
    return GENRES.map(genre => ({
      genre,
      albums: genre.entityGenre
        ? allAlbums.filter(a => a.genre === genre.entityGenre)
        : [],
    })).filter(s => s.albums.length > 0);
  }, [allAlbums]);

  return (
    <div className="-mt-6 min-h-screen px-0 pt-6" style={{ background: '#111' }}>
      {genreSections.length > 0 ? (
        genreSections.map(({ genre, albums }) => (
          <GenreSection key={genre.id} genre={genre} albums={albums} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-32">
          <span className="text-5xl mb-4">🎵</span>
          <p className="text-white/30 text-sm mb-4">No albums yet.</p>
          <Link to="/discover" className="text-sm text-white/60 hover:text-white">
            Add the first album →
          </Link>
        </div>
      )}
    </div>
  );
}