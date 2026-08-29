import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CoverImage from '@/components/music/CoverImage';

export default function ReviewCard({ review, showAlbum = true }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-200"
      style={{ background: 'rgba(12,15,35,0.82)', border: '1px solid rgba(124,111,255,0.18)' }}>
      <div className="flex gap-4">
        {showAlbum && (
          <Link to={`/album/${review.album_id}`} className="shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <CoverImage src={review.album_cover_url} alt={review.album_title || 'Album artwork'} className="w-full h-full object-cover" />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {showAlbum && (
                <Link to={`/album/${review.album_id}`} className="text-sm font-semibold transition-colors" style={{ color: 'rgba(220,225,255,0.9)' }}>
                  {review.album_title} — {review.album_artist}
                </Link>
              )}
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                {review.title && <span className="text-sm font-medium">"{review.title}"</span>}
              </div>
            </div>
          </div>
          <p className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap" style={{ color: 'rgba(140,155,210,0.7)' }}>{review.content}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(140,155,210,0.55)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.2)' }}>
                <User className="w-3 h-3" style={{ color: '#a5b4fc' }} />
              </div>
              <span>{review.reviewer_name || 'Anonymous'}</span>
              {review.created_date && (
                <>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(140,155,210,0.55)' }}>
              <Heart className="w-3.5 h-3.5" />
              <span>{review.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}