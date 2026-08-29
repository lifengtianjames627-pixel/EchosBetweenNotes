import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { GENRES } from '@/lib/genreConfig';
import { useLang } from '@/i18n/LanguageContext';
import { useGenreText } from '@/i18n/useGenreText';
import ReviewLead from '@/components/reviews/ReviewLead';
import ReviewFeed from '@/components/reviews/ReviewFeed';
import GenreRail from '@/components/reviews/GenreRail';

export default function WrittenReviews() {
  const navigate = useNavigate(); const { t } = useLang(); const { localizedGenres } = useGenreText();
  const { data: reviews = [] } = useQuery({ queryKey: ['public-reviews'], queryFn: () => base44.entities.Review.list('-created_date', 30) });
  const visible = reviews.filter(item => !item.moderation_status || item.moderation_status === 'approved');
  const open = id => navigate(`/album/${id}`);
  return <div className="min-h-screen px-4 pb-20 sm:px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, #161d46 0%, #080a16 48%, #030408 100%)' }}><div className="mx-auto max-w-6xl"><button onClick={() => navigate('/')} className="flex items-center gap-2 pt-7 text-xs font-semibold" style={{ color: 'rgba(190,200,240,0.63)' }}><ArrowLeft className="h-4 w-4" /> {t('common.back')}</button><header className="mt-10 grid gap-5 lg:grid-cols-[1fr_260px] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: 'rgba(192,132,252,0.76)' }}>Listening, closely</p><h1 className="mt-2 font-playfair text-5xl italic sm:text-6xl" style={{ color: '#edf0ff' }}>Written Reviews</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(180,192,230,0.65)' }}>{t('reviews.subtitle')}</p></div><div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(165,180,252,0.18)' }}><img src="https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/9e48e0666_generated_image.png" alt="Records and review notes" className="h-32 w-full object-cover" /></div></header><GenreRail genres={localizedGenres || GENRES} onSelect={id => navigate(`/genre/${id}`)} /><main className="mt-8"><ReviewLead review={visible[0]} onOpen={open} /><ReviewFeed reviews={visible.slice(1, 10)} onOpen={open} /></main></div></div>;
}