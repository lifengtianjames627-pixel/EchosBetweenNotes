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
    <div className="min-h-screen" style={{ background: '#f3efe6' }}>
      {/* Layer 1 — blurred ambient header */}
      <div className="relative h-[230px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: 'blur(24px) saturate(0.55) brightness(1.05)', transform: 'scale(1.12)' }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(243,239,230,0.62)' }} />
        <div className="absolute inset-0 flex items-end pb-7 px-6 sm:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: '#bf7a35' }}>Listening, closely</p>
            <h1 className="mt-2 font-playfair text-5xl italic sm:text-6xl" style={{ color: '#1a1815' }}>Written Reviews</h1>
          </div>
        </div>
      </div>

      {/* Layer 2 — beige genre filter bar */}
      <GenreRail genres={localizedGenres || GENRES} onSelect={id => navigate(`/genre/${id}`)} />

      {/* Layer 3 — cream paper content sheet */}
      <div className="mx-auto max-w-5xl my-10 px-8 sm:px-12 py-10" style={{ background: '#faf8f2', border: '1px solid #e6ddc9', boxShadow: '0 2px 20px rgba(120,100,80,0.06)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#6b6358' }}>
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <main className="mt-8">
          <ReviewLead review={visible[0]} onOpen={open} />
          <ReviewFeed reviews={visible.slice(1, 10)} onOpen={open} />
        </main>
      </div>
    </div>
  );
}