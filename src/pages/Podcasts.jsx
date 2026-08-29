import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Headphones, ArrowUpRight } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import { useLang } from '@/i18n/LanguageContext';

export default function Podcasts() {
  const navigate = useNavigate();
  const { t } = useLang();

  const { data: episodes = [] } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => base44.entities.Podcast.list('-created_date', 300),
  });

  const countFor = (id) => episodes.filter(e => e.category === id).length;

  return (
    <div className="min-h-screen relative" style={{ background: '#070910' }}>

      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(124,111,255,0.15)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'rgba(160,175,215,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-14 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)' }}>
              <Headphones className="w-5 h-5" style={{ color: '#a5b4fc' }} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: 'rgba(165,138,252,0.7)' }}>{t('pod.subtitle')}</span>
          </div>
          <h1 className="font-playfair italic leading-none mb-3"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Music Podcasts
          </h1>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PODCAST_CATEGORIES.map((cat, i) => {
            const n = countFor(cat.id);
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/podcasts/${cat.id}`)}
                className="group relative text-left p-6 rounded-2xl transition-all"
                style={{ background: 'rgba(14,17,38,0.7)', border: '1px solid rgba(124,111,255,0.14)' }}
              >
                <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full" style={{ background: cat.accent }} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: `${cat.accent}bb` }}>
                    {String(i + 1).padStart(2, '0')} · {t(`pod.cat.${cat.id}.tagline`)}
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-30 transition-opacity group-hover:opacity-100" style={{ color: cat.accent }} />
                </div>
                <h2 className="font-playfair italic text-2xl leading-tight mb-2" style={{ color: 'rgba(230,232,255,0.95)' }}>
                  {t(`pod.cat.${cat.id}.label`)}
                </h2>
                <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: 'rgba(140,155,210,0.55)' }}>
                  {t(`pod.cat.${cat.id}.desc`)}
                </p>
                <span className="text-[11px] font-medium" style={{ color: 'rgba(140,155,210,0.4)' }}>
                  {n} {n === 1 ? 'episode' : 'episodes'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}