import React from 'react';
import { ArrowRight } from 'lucide-react';
import CoverImage from '@/components/music/CoverImage';

export default function ReviewLead({ review, onOpen }) {
  if (!review) return null;
  return <button onClick={() => onOpen(review.album_id)} className="group relative min-h-[310px] overflow-hidden rounded-3xl text-left" style={{ border: '1px solid rgba(165,180,252,0.25)' }}>
    <CoverImage src={review.album_cover_url} alt={review.album_title || 'Album artwork'} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(5,7,18,0.94) 0%, rgba(5,7,18,0.58) 55%, rgba(5,7,18,0.12) 100%)' }} />
    <div className="relative flex min-h-[310px] max-w-xl flex-col justify-end p-6 sm:p-8"><span className="text-[10px] uppercase tracking-[0.24em] font-bold" style={{ color: '#c4baff' }}>Featured discussion</span><p className="mt-3 font-playfair text-3xl italic leading-tight text-white sm:text-4xl">{review.title || review.album_title}</p><p className="mt-2 text-sm" style={{ color: 'rgba(225,230,255,0.78)' }}>{review.album_artist} · {review.reviewer_name || 'Chordmates listener'}</p><p className="mt-3 line-clamp-2 text-sm leading-relaxed" style={{ color: 'rgba(225,230,255,0.7)' }}>{review.content}</p><span className="mt-5 flex items-center gap-2 text-xs font-bold text-white">Read the discussion <ArrowRight className="h-4 w-4" /></span></div>
  </button>;
}