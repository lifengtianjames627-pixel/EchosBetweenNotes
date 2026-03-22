import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import StarRating from './StarRating';
import { Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewCard({ review, showAlbum = true }) {
  return (
    <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex gap-4">
        {showAlbum && (
          <Link to={`/album/${review.album_id}`} className="shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              {review.album_cover_url ? (
                <img src={review.album_cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="text-lg">🎵</span>
                </div>
              )}
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {showAlbum && (
                <Link to={`/album/${review.album_id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                  {review.album_title} — {review.album_artist}
                </Link>
              )}
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                {review.title && <span className="text-sm font-medium">"{review.title}"</span>}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{review.content}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <span>{review.reviewer_name || 'Anonymous'}</span>
              {review.created_date && (
                <>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3.5 h-3.5" />
              <span>{review.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}