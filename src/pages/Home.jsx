import React, { useState, useMemo, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Users, ArrowRight, MessageSquare, Disc3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import GenreBar from '@/components/GenreBar';
import StarRating from '@/components/StarRating';
import { GENRES, genreThemes } from '@/lib/genreConfig';

const ThemeCtx = createContext(genreThemes.default);
const useTheme = () => useContext(ThemeCtx);

/* ── Hover card wrapper ── */
function ThemeCard({ children, className = '', style }) {
  const theme = useTheme();
  const effect = theme.hoverEffect || 'lift';

  const hoverAnim = {
    lift:         { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' },
    shake:        { x: [-2, 2, -2, 1, 0] },
    scale:        { scale: 1.015 },
    'glow-red':   { boxShadow: '0 0 22px rgba(200,17,17,0.38)' },
    'glow-blue':  { boxShadow: '0 0 22px rgba(64,128,255,0.38)' },
    'glow-purple':{ boxShadow: '0 0 22px rgba(180,127,255,0.32)' },
    'glow-warm':  { boxShadow: '0 0 22px rgba(210,160,20,0.3)' },
    instant:      { background: '#fff', color: '#000' },
    none:         {},
  }[effect] ?? {};

  return (
    <motion.div
      className={className}
      style={{ ...theme.card, ...style }}
      whileHover={hoverAnim}
      transition={{ duration: effect === 'instant' ? 0 : effect === 'shake' ? 0.25 : 0.18 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Review feed item ── */
function ReviewFeedItem({ review }) {
  const theme = useTheme();
  return (
    <Link to={`/album/${review.album_id}`}>
      <ThemeCard className="flex gap-4 p-4">
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden">
          {review.album_cover_url
            ? <img src={review.album_cover_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(150,60,100,0.15)' }}>🎵</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs truncate" style={{ color: theme.muted }}>{review.album_title} · {review.album_artist}</p>
            <span className="text-[11px] whitespace-nowrap shrink-0" style={{ color: theme.muted }}>
              {review.created_date ? formatDistanceToNow(new Date(review.created_date), { addSuffix: true }) : ''}
            </span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          {review.title && <p className="text-sm mt-1 truncate" style={{ ...theme.text, fontWeight: 600 }}>"{review.title}"</p>}
          <p className="text-sm mt-0.5 line-clamp-2 leading-relaxed" style={{ color: theme.muted }}>{review.content}</p>
          <p className="text-xs mt-1.5" style={{ color: theme.muted }}>{review.reviewer_name || 'Anonymous'}</p>
        </div>
      </ThemeCard>
    </Link>
  );
}

/* ── Album feed item ── */
function AlbumFeedItem({ album }) {
  const theme = useTheme();
  return (
    <Link to={`/album/${album.id}`}>
      <ThemeCard className="flex gap-4 p-4">
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden">
          {album.cover_url
            ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(150,60,100,0.15)' }}>🎵</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={theme.text}>{album.title}</p>
          <p className="text-xs truncate" style={{ color: theme.muted }}>{album.artist}{album.release_year ? ` · ${album.release_year}` : ''}</p>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={album.avg_rating || 0} size="sm" />
            <span className="flex items-center gap-1 text-xs" style={{ color: theme.muted }}>
              <MessageSquare className="w-3 h-3" />{album.review_count || 0} reviews
            </span>
          </div>
          {album.description && (
            <p className="text-xs mt-1 line-clamp-1" style={{ color: theme.muted }}>{album.description}</p>
          )}
        </div>
      </ThemeCard>
    </Link>
  );
}

/* ── Band sidebar item ── */
function BandItem({ band }) {
  const theme = useTheme();
  return (
    <Link to={`/band/${band.id}`} className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${theme.accent}22` }}>
        <Users className="w-4 h-4" style={{ color: theme.accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={theme.text}>{band.name}</p>
        <p className="text-xs truncate" style={{ color: theme.muted }}>{band.genre?.replace(/_/g, ' ')} · {band.member_count || 1} members</p>
      </div>
      {band.status === 'recruiting' && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${theme.accent}22`, color: theme.accent }}>hiring</span>
      )}
    </Link>
  );
}

/* ── Main page ── */
export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { data: allAlbums = [] } = useQuery({
    queryKey: ['albums-home'],
    queryFn: () => base44.entities.Album.list('-avg_rating', 40),
  });
  const { data: allReviews = [] } = useQuery({
    queryKey: ['reviews-home'],
    queryFn: () => base44.entities.Review.list('-created_date', 40),
  });
  const { data: bands = [] } = useQuery({
    queryKey: ['bands-home'],
    queryFn: () => base44.entities.Band.list('-created_date', 8),
  });

  const currentGenre = GENRES.find(g => g.id === selectedGenre);
  const theme = selectedGenre ? (genreThemes[selectedGenre] ?? genreThemes.default) : genreThemes.default;

  const albums = useMemo(() => {
    if (!selectedGenre || !currentGenre?.entityGenre) return allAlbums;
    return allAlbums.filter(a => a.genre === currentGenre.entityGenre);
  }, [allAlbums, selectedGenre, currentGenre]);

  const reviews = useMemo(() => {
    if (!selectedGenre || !currentGenre?.entityGenre) return allReviews;
    const ids = new Set(albums.map(a => a.id));
    return allReviews.filter(r => ids.has(r.album_id));
  }, [allReviews, albums, selectedGenre, currentGenre]);

  const feedItems = useMemo(() => {
    const items = [];
    const max = Math.max(reviews.length, albums.length);
    for (let i = 0; i < max; i++) {
      if (reviews[i]) items.push({ type: 'review', data: reviews[i] });
      if (albums[i]) items.push({ type: 'album', data: albums[i] });
    }
    return items;
  }, [reviews, albums]);

  return (
    <ThemeCtx.Provider value={theme}>
      <div className="-mt-6">
        <GenreBar selected={selectedGenre} onSelect={setSelectedGenre} />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGenre || 'default'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={theme.wrapper}
          >
            {/* Genre story header */}
            {currentGenre && (
              <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${theme.accent}30` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{currentGenre.icon}</span>
                  <h2 className="text-xl font-bold" style={{ ...theme.text, color: theme.accent }}>{currentGenre.label}</h2>
                </div>
                <p className="text-sm font-medium" style={{ color: theme.muted }}>{currentGenre.tagline}</p>
                <p className="text-sm mt-1" style={{ opacity: 0.75 }}>{currentGenre.desc}</p>
              </div>
            )}

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main feed */}
              <div className="lg:col-span-2 space-y-3">
                {!currentGenre && (
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.muted }}>Latest Activity</p>
                )}
                {feedItems.length === 0 ? (
                  <div className="text-center py-16 rounded-xl" style={theme.card}>
                    <Disc3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm opacity-50">No content yet for this genre.</p>
                  </div>
                ) : (
                  feedItems.map(item =>
                    item.type === 'review'
                      ? <ReviewFeedItem key={`r-${item.data.id}`} review={item.data} />
                      : <AlbumFeedItem key={`a-${item.data.id}`} album={item.data} />
                  )
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Bands */}
                <div style={{ ...theme.card, padding: '16px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={theme.text}>Bands</h3>
                    <Link to="/bands" className="text-xs flex items-center gap-0.5" style={{ color: theme.accent }}>
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {bands.length > 0
                    ? <div style={{ borderTop: `1px solid ${theme.accent}18` }}>{bands.slice(0, 5).map(b => <BandItem key={b.id} band={b} />)}</div>
                    : <p className="text-xs text-center py-4 opacity-40">No bands yet</p>
                  }
                </div>

                {/* Top Rated */}
                {allAlbums.length > 0 && (
                  <div style={{ ...theme.card, padding: '16px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={theme.text}>Top Rated</h3>
                      <Link to="/discover" className="text-xs flex items-center gap-0.5" style={{ color: theme.accent }}>
                        All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {allAlbums.slice(0, 6).map((album, idx) => (
                        <Link key={album.id} to={`/album/${album.id}`} className="flex items-center gap-3">
                          <span className="text-xs font-bold w-4 opacity-40" style={{ color: theme.muted }}>{idx + 1}</span>
                          <div className="w-9 h-9 rounded-md overflow-hidden shrink-0">
                            {album.cover_url
                              ? <img src={album.cover_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm" style={{ background: 'rgba(150,60,100,0.15)' }}>🎵</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={theme.text}>{album.title}</p>
                            <p className="text-xs truncate" style={{ color: theme.muted }}>{album.artist}</p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3" style={{ fill: theme.accent, color: theme.accent }} />
                            <span className="text-xs font-medium" style={{ color: theme.accent }}>{album.avg_rating?.toFixed(1) || '—'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ThemeCtx.Provider>
  );
}