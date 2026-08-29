import React from 'react';
import CoverImage from '@/components/music/CoverImage';

// Paper grid of review cards — square cover (no border / no radius / no zoom),
// ochre artist tag, black serif title with hover underline, rating as a plain
// number (no star component), one-line summary.
export default function ReviewFeed({ reviews, onOpen }) {
  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-playfair text-2xl italic" style={{ color: '#1a1815' }}>Trending discussions</h2>
        <span className="text-xs" style={{ color: '#8a7e6f' }}>{reviews.length} recent</span>
      </div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map(review => (
          <button key={review.id} onClick={() => onOpen(review.album_id)} className="group text-left">
            <CoverImage src={review.album_cover_url} alt={review.album_title || 'Album artwork'} className="w-full aspect-square object-cover" />
            <p className="mt-3 text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: '#bf7a35' }}>{review.album_artist}</p>
            <h3 className="mt-1 font-playfair text-lg italic leading-tight border-b border-transparent transition-colors group-hover:border-[#1a1815] inline-block" style={{ color: '#1a1815' }}>
              {review.title || review.album_title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: '#6b6358' }}>{review.content}</p>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: '#bf7a35' }}>
              {review.rating ? `${(review.rating * 2).toFixed(1)}/10` : '—'} · {review.reviewer_name || 'Listener'}
            </p>
          </button>
        ))}
      </div>
      {reviews.length === 0 && (
        <p className="py-16 text-center text-sm" style={{ color: '#8a7e6f' }}>New discussions will appear here.</p>
      )}
    </section>
  );
}