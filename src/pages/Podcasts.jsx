import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Headphones, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import PodcastEditorialStrip from '@/components/podcasts/PodcastEditorialStrip';
import { useLang } from '@/i18n/LanguageContext';

function fmtTotal(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}min` : `${m}min`;
}

export default function Podcasts() {
  const navigate = useNavigate();
  const { t } = useLang();
  const trackRef = useRef(null);

  const { data: episodes = [] } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => base44.entities.Podcast.list('-created_date', 300),
  });

  const metaFor = (id) => {
    const mine = episodes.filter(e => e.category === id);
    const covers = mine.map(e => e.cover_url).filter(Boolean);
    const total = mine.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    return { count: mine.length, covers, total };
  };

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (320 + 16), behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#070910' }}>

      {/* subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.10) 0%, transparent 70%)' }} />
      </div>

      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(124,111,255,0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'rgba(160,175,215,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
          </button>
        </div>
      </div>

      <div className="relative z-10 pt-12 pb-20">
        {/* Section header (constrained) */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)' }}>
                <Headphones className="w-4.5 h-4.5" style={{ color: '#a5b4fc' }} />
              </div>
              <span className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: 'rgba(165,138,252,0.7)' }}>{t('pod.subtitle')}</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <h1 className="font-playfair italic leading-none" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)', background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 60%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Music Podcasts
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => scrollBy(-1)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollBy(1)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carousel (aligned with header, soft right fade) */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10" style={{ background: 'linear-gradient(to left, #070910 30%, transparent)' }} />
          <div ref={trackRef} className="overflow-x-auto no-scrollbar pb-2" style={{ scrollbarWidth: 'none', scrollSnapType: 'x proximity' }}>
            <div className="flex gap-4 pr-6" style={{ width: 'max-content' }}>
              {PODCAST_CATEGORIES.map((cat, i) => {
                const { count, covers, total } = metaFor(cat.id);
                const front = covers[0];
                const thumbs = covers.slice(1, 4);
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/podcasts/${cat.id}`)}
                    className="group shrink-0 text-left rounded-2xl overflow-hidden w-[300px] transition-all"
                    style={{ background: 'rgba(14,17,38,0.7)', border: '1px solid rgba(124,111,255,0.14)', scrollSnapAlign: 'start' }}
                  >
                    {/* visual */}
                    <div className="relative flex gap-1 p-2" style={{ height: 168 }}>
                      <div className="relative flex-1 rounded-xl overflow-hidden" style={{ background: `${cat.accent}14` }}>
                        {front ? (
                          <img src={front} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <Headphones className="w-8 h-8" style={{ color: 'rgba(165,138,252,0.25)' }} />
                            <span className="absolute top-2 right-3 font-playfair italic" style={{ fontSize: 56, color: 'rgba(165,138,252,0.08)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'rgba(255,255,255,0.92)' }}>
                          <Play className="w-4 h-4" style={{ color: '#0b0e20', marginLeft: 1 }} fill="currentColor" />
                        </div>
                        <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: cat.accent, opacity: 0.55 }} />
                      </div>
                      {thumbs.length > 0 && (
                        <div className="w-14 flex flex-col gap-1 py-0.5">
                          {thumbs.map((c, ti) => (
                            <div key={ti} className="flex-1 rounded-md overflow-hidden" style={{ background: `${cat.accent}10` }}>
                              <img src={c} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* info */}
                    <div className="px-4 pb-4 pt-1">
                      <span className="text-[10px] uppercase tracking-[0.22em] font-semibold block mb-1.5" style={{ color: `${cat.accent}aa` }}>
                        {String(i + 1).padStart(2, '0')} · {t(`pod.cat.${cat.id}.tagline`)}
                      </span>
                      <h2 className="font-playfair italic text-xl leading-tight mb-1.5" style={{ color: 'rgba(230,232,255,0.95)' }}>
                        {t(`pod.cat.${cat.id}.label`)}
                      </h2>
                      <p className="text-[11px] mb-2" style={{ color: 'rgba(140,155,210,0.45)' }}>
                        {count > 0 ? `${count} ${count === 1 ? 'episode' : 'episodes'}${fmtTotal(total) ? ' · ' + fmtTotal(total) : ''}` : 'No episodes yet'}
                      </p>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(140,155,210,0.6)' }}>
                        {t(`pod.cat.${cat.id}.desc`)}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          </div>
          <PodcastEditorialStrip />
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}