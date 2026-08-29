import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CoverImage from '@/components/music/CoverImage';

// Paper review card — cream bg, thin warm border, near-black ink, ochre rating
// number (no star component), hover border darkens slightly.
export default function ReviewCard({ review, showAlbum = true }) {
  return (
    <div className="p-5 transition-colors" style={{ background: '#faf8f2', border: '1px solid #e6ddc9' }}>
      <div className="flex gap-4">
        {showAlbum && (
          <Link to={`/album/${review.album_id}`} className="shrink-0">
            <div className="w-16 h-16 overflow-hidden" style={{ background: '#e6ddc9' }}>
              <CoverImage src={review.album_cover_url} alt={review.album_title || 'Album artwork'} className="w-full h-full object-cover" />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {showAlbum && (
                <Link to={`/album/${review.album_id}`} className="text-sm font-semibold transition-colors hover:underline" style={{ color: '#1a1815' }}>
                  {review.album_title} — {review.album_artist}
                </Link>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold" style={{ color: '#bf7a35' }}>{review.rating ? `${(review.rating * 2).toFixed(1)}/10` : '—'}</span>
                {review.title && <span className="text-sm font-medium" style={{ color: '#1a1815' }}>"{review.title}"</span>}
              </div>
            </div>
          </div>
          <p className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap" style={{ color: '#5a534a' }}>{review.content}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8a7e6f' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#e6ddc9' }}>
                <User className="w-3 h-3" style={{ color: '#6b6358' }} />
              </div>
              <span>{review.reviewer_name || 'Anonymous'}</span>
              {review.created_date && (
                <>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#8a7e6f' }}>
              <Heart className="w-3.5 h-3.5" />
              <span>{review.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}