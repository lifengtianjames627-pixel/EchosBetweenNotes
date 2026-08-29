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
  const navigate = useNavigate();
  const { t } = useLang();
  const { localizedGenres } = useGenreText();
  const { data: reviews = [] } = useQuery({ queryKey: ['public-reviews'], queryFn: () => base44.entities.Review.list('-created_date', 30) });
  const visible = reviews.filter(item => !item.moderation_status || item.moderation_status === 'approved');
  const open = id => navigate(`/album/${id}`);
  return (
    <div className="min-h-screen px-4 pb-20 sm:px-6" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(107,100,148,0.08) 0%, transparent 55%), linear-gradient(180deg, #14161f 0%, #101218 100%)' }}>
      <div className="mx-auto max-w-6xl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 pt-7 text-xs font-semibold" style={{ color: '#9490a8' }}>
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <header className="mt-10 grid gap-5 lg:grid-cols-[1fr_260px] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: '#b8a07a' }}>Listening, closely</p>
            <h1 className="mt-2 font-playfair text-5xl italic sm:text-6xl" style={{ color: '#e8e6f0' }}>Written Reviews</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: '#9490a8' }}>{t('reviews.subtitle')}</p>
          </div>
          <div className="overflow-hidden rounded-2xl flex items-center justify-center min-h-[128px]" style={{ border: '1px solid rgba(107,100,148,0.22)', background: 'radial-gradient(ellipse at 70% 30%, rgba(176,122,144,0.12) 0%, transparent 60%), linear-gradient(135deg, #1a1c26 0%, #14161f 100%)' }}>
            <span className="font-playfair italic text-5xl" style={{ color: 'rgba(184,160,122,0.3)' }}>♪</span>
          </div>
        </header>
        <GenreRail genres={localizedGenres || GENRES} onSelect={id => navigate(`/genre/${id}`)} />
        <main className="mt-8">
          <ReviewLead review={visible[0]} onOpen={open} />
          <ReviewFeed reviews={visible.slice(1, 10)} onOpen={open} accent="#7c83b0" text="#e8e6f0" />
        </main>
      </div>
    </div>
  );
}