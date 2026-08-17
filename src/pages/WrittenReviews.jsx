import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { GENRES } from '@/lib/genreConfig';
import GenreGauge from '@/components/genre-dashboard/GenreGauge';
import AllGenresModal from '@/components/genre-dashboard/AllGenresModal';
import { useLang } from '@/i18n/LanguageContext';
import { useGenreText } from '@/i18n/useGenreText';

export default function WrittenReviews() {
  const navigate = useNavigate();
  // Everything here except actual review text, album titles and artist names is
  // system copy — genre names and taglines included — so it follows the system language.
  const { t } = useLang();
  const { localizedGenres } = useGenreText();
  const [startIdx, setStartIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const visible = [0, 1, 2].map(i => {
    const idx = (startIdx + i) % localizedGenres.length;
    return { genre: localizedGenres[idx], colorIdx: idx };
  });

  const goPrev = () => setStartIdx(prev => (prev - 3 + GENRES.length) % GENRES.length);
  const goNext = () => setStartIdx(prev => (prev + 3) % GENRES.length);
  const goToGenre = (id) => navigate(`/genre/${id}`);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)', transform: 'translate(-40%, -40%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(165,138,252,0.10) 0%, transparent 65%)', transform: 'translate(40%, 40%)' }} />

        {[
          { top: '6%',  left: '2%',  size: 150, dur: 24 },
          { top: '55%', right: '2%', size: 130, dur: 30 },
        ].map((v, i) => (
          <motion.div
            key={`vinyl-${i}`}
            className="absolute rounded-full"
            style={{
              top: v.top, left: v.left, right: v.right,
              width: v.size, height: v.size,
              opacity: 0.18,
              background: 'conic-gradient(from 0deg, #12122a, #1c1c40, #131330, #0e0e22, #12122a)',
              boxShadow: '0 0 40px 6px rgba(124,111,255,0.15)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: v.dur, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute rounded-full bg-black" style={{ width: v.size * 0.13, height: v.size * 0.13, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            {[0.35, 0.55, 0.72, 0.87].map((r, j) => (
              <div key={j} className="absolute rounded-full border" style={{ width: `${r * 100}%`, height: `${r * 100}%`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(165,138,252,0.12)' }} />
            ))}
          </motion.div>
        ))}

        {[
          { top: '12%', left: '9%',  note: '♪', size: 40, delay: 0   },
          { top: '38%', left: '6%',  note: '♫', size: 32, delay: 1.2 },
          { top: '65%', left: '10%', note: '♬', size: 36, delay: 2.4 },
          { top: '10%', right: '8%', note: '♫', size: 38, delay: 0.6 },
          { top: '40%', right: '7%', note: '♩', size: 30, delay: 1.8 },
          { top: '68%', right: '9%', note: '♪', size: 42, delay: 3.0 },
        ].map((n, i) => (
          <motion.span
            key={`note-${i}`}
            className="absolute select-none"
            style={{
              top: n.top, left: n.left, right: n.right,
              fontSize: n.size,
              color: 'rgba(165,138,252,0.5)',
              filter: 'drop-shadow(0 0 12px rgba(124,111,255,0.5))',
              lineHeight: 1,
            }}
            animate={{ y: [-10, 10, -10], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 7, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {n.note}
          </motion.span>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-[5px]" style={{ opacity: 0.2 }}>
          {[8,14,24,38,55,72,88,96,88,72,55,38,24,14,8].map((h, i) => (
            <motion.div key={i} className="rounded-full" style={{ width: 4, height: h, background: 'rgba(165,138,252,0.8)' }}
              animate={{ scaleY: [1, 0.3 + (i % 4) * 0.2, 1] }}
              transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'rgba(160,175,215,0.6)' }}
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center pt-6 pb-2 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-playfair italic"
          style={{
            fontSize: 'clamp(3.3rem, 9vw, 5.25rem)',
            background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
            filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.4))',
          }}
        >
          Written Review
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm mt-2"
          style={{ color: 'rgba(160,175,220,0.55)' }}
        >
          {t('reviews.subtitle')}
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 pb-8 px-4 flex flex-col items-center mt-2 lg:pr-56 xl:pr-72"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
      >
        <GenreGauge items={visible} onSelect={goToGenre} />

        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs" style={{ color: 'rgba(140,155,210,0.4)' }}>
            {startIdx + 1}–{Math.min(startIdx + 3, GENRES.length)} {t('common.of')} {GENRES.length}
          </span>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all hover:scale-105 mt-4"
          style={{ background: 'rgba(124,111,255,0.1)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.2)' }}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> {t('common.allGenres')}
        </button>
      </motion.div>

      <AnimatePresence>
        {showAll && (
          <AllGenresModal
            genres={localizedGenres}
            onClose={() => setShowAll(false)}
            onSelect={(id) => { setShowAll(false); goToGenre(id); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}