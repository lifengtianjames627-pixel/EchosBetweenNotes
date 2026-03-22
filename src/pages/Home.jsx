import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Users, ArrowRight, Disc3, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GenreBadge from '@/components/GenreBadge';
import StarRating from '@/components/StarRating';

function ReviewFeedItem({ review }) {
  return (
    <Link to={`/album/${review.album_id}`} className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
        {review.album_cover_url ? (
          <img src={review.album_cover_url} alt={review.album_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-2xl">🎵</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{review.album_title} · {review.album_artist}</p>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {review.created_date ? formatDistanceToNow(new Date(review.created_date), { addSuffix: true }) : ''}
          </span>
        </div>
        {review.title && <p className="text-sm font-semibold mt-1 truncate">"{review.title}"</p>}
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{review.content}</p>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{review.reviewer_name || 'Anonymous'}</p>
      </div>
    </Link>
  );
}

function AlbumDiscussionItem({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-2xl">🎵</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{album.title}</p>
            <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
          </div>
          {album.genre && <GenreBadge genre={album.genre} className="shrink-0" />}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <StarRating rating={album.avg_rating || 0} size="sm" />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            {album.review_count || 0} reviews
          </span>
        </div>
        {album.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{album.description}</p>
        )}
      </div>
    </Link>
  );
}

function BandSidebarItem({ band }) {
  return (
    <Link to={`/band/${band.id}`} className="flex items-center gap-3 py-2.5 group">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
        <Users className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{band.name}</p>
        <p className="text-xs text-muted-foreground truncate">{band.genre?.replace(/_/g, ' ')} · {band.member_count || 1} members</p>
      </div>
      {band.status === 'recruiting' && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">hiring</span>
      )}
    </Link>
  );
}

export default function Home() {
  const { data: albums = [] } = useQuery({
    queryKey: ['albums-home'],
    queryFn: () => base44.entities.Album.list('-avg_rating', 12),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-home'],
    queryFn: () => base44.entities.Review.list('-created_date', 20),
  });

  const { data: bands = [] } = useQuery({
    queryKey: ['bands-home'],
    queryFn: () => base44.entities.Band.list('-created_date', 8),
  });

  // Merge reviews and albums into a unified feed, alternating
  const feedItems = [];
  const maxLen = Math.max(reviews.length, albums.length);
  for (let i = 0; i < maxLen; i++) {
    if (reviews[i]) feedItems.push({ type: 'review', data: reviews[i] });
    if (albums[i]) feedItems.push({ type: 'album', data: albums[i] });
  }

  const recruitingBands = bands.filter(b => b.status === 'recruiting');
  const otherBands = bands.filter(b => b.status !== 'recruiting');
  const sidebarBands = [...recruitingBands, ...otherBands].slice(0, 6);

  return (
    <div className="-mt-6 space-y-0">
      {/* Slim top banner */}
      <div
        className="relative -mx-4 md:-mx-8 px-6 md:px-12 py-4 mb-6 flex items-center justify-between gap-4"
        style={{ background: 'linear-gradient(90deg, hsl(330,75%,52%) 0%, hsl(280,65%,52%) 100%)' }}
      >
        <div className="flex items-center gap-3">
          <Disc3 className="w-5 h-5 text-white opacity-80" />
          <span className="text-white font-semibold text-sm">SoundWave · Your school's music community</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/discover" className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors">
            Albums
          </Link>
          <Link to="/bands" className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors">
            Bands
          </Link>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed — center/main */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity Feed</h2>
            <Link to="/discover" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              All albums <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {feedItems.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Disc3 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet. Explore albums and leave a review!</p>
            </div>
          ) : (
            feedItems.map((item, idx) =>
              item.type === 'review'
                ? <ReviewFeedItem key={`r-${item.data.id}`} review={item.data} />
                : <AlbumDiscussionItem key={`a-${item.data.id}`} album={item.data} />
            )
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bands */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Bands</h3>
              <Link to="/bands" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {sidebarBands.length > 0 ? (
              <div className="divide-y divide-border">
                {sidebarBands.map(band => <BandSidebarItem key={band.id} band={band} />)}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No bands yet</p>
            )}
          </div>

          {/* Top Rated Albums */}
          {albums.slice(0, 5).length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Top Rated</h3>
                <Link to="/discover" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {albums.slice(0, 5).map((album, idx) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="flex items-center gap-3 group">
                    <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}</span>
                    <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-muted">
                      {album.cover_url
                        ? <img src={album.cover_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm">🎵</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{album.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{album.avg_rating?.toFixed(1) || '—'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}