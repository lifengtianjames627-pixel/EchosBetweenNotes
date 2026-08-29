import React from 'react';
import { ArrowRight } from 'lucide-react';
import CoverImage from '@/components/music/CoverImage';

export default function ReviewLead({ review, onOpen }) {
  if (!review) return null;
  return (
    <button onClick={() => onOpen(review.album_id)} className="group relative min-h-[310px] overflow-hidden rounded-3xl text-left" style={{ border: '1px solid rgba(176,101,71,0.22)', boxShadow: '0 12px 34px rgba(120,100,80,0.10)' }}>
      <CoverImage src={review.album_cover_url} alt={review.album_title || 'Album artwork'} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      {/* Warm paper scrim — photo fades into the page like a journal spread */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(247,243,236,0.97) 0%, rgba(247,243,236,0.82) 45%, rgba(247,243,236,0.25) 78%, rgba(247,243,236,0.05) 100%)' }} />
      <div className="relative flex min-h-[310px] max-w-xl flex-col justify-end p-6 sm:p-8">
        <span className="text-[10px] uppercase tracking-[0.24em] font-bold" style={{ color: '#b06547' }}>Featured discussion</span>
        <p className="mt-3 font-playfair text-3xl italic leading-tight sm:text-4xl" style={{ color: '#2b2620' }}>{review.title || review.album_title}</p>
        <p className="mt-2 text-sm" style={{ color: '#6b6358' }}>{review.album_artist} · {review.reviewer_name || 'Chordmates listener'}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed" style={{ color: '#6b6358' }}>{review.content}</p>
        <span className="mt-5 flex items-center gap-2 text-xs font-bold" style={{ color: '#b06547' }}>Read the discussion <ArrowRight className="h-4 w-4" /></span>
      </div>
    </button>
  );
}