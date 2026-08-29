import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Headphones, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import { useLang } from '@/i18n/LanguageContext';

// Per-category vertical offset of the note on the staff (px from centre),
// so each theme sits on its own pitch line — feels like real notation.
const NOTE_OFFSETS = [-26, 12, -8, 22, -4, 16];

export default function Podcasts() {
  const navigate = useNavigate();
  const { t } = useLang();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const panelCount = PODCAST_CATEGORIES.length;

  const scrollTo = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const panel = el.children[0].children[i + 1]; // +1 past the spacer
    if (panel) panel.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const i = Math.round(el.scrollLeft / w);
    if (i !== active && i >= 0 && i < panelCount) setActive(i);
  }, [active, panelCount]);

  useEffect(() => {
    let raf;
    const handler = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll); };
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handler, { passive: true });
    return () => { el.removeEventListener('scroll', handler); cancelAnimationFrame(raf); };
  }, [onScroll]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)', transform: 'translate(-40%, -40%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.10) 0%, transparent 65%)', transform: 'translate(40%, 40%)' }} />
        {[
          { top: '10%', left: '8%',  note: '♪', size: 38, delay: 0   },
          { top: '62%', left: '9%',  note: '♬', size: 34, delay: 2.6 },
          { top: '14%', right: '7%', note: '♫', size: 36, delay: 0.8 },
          { top: '70%', right: '8%', note: '♪', size: 40, delay: 3.2 },
        ].map((n, i) => (
          <motion.span key={`note-${i}`} className="absolute select-none"
            style={{ top: n.top, left: n.left, right: n.right, fontSize: n.size, color: 'rgba(165,138,252,0.5)', filter: 'drop-shadow(0 0 12px rgba(124,111,255,0.5))', lineHeight: 1 }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 7, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}>{n.note}</motion.span>
        ))}
      </div>

      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(124,111,255,0.15)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'rgba(160,175,215,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-14 pb-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)' }}>
              <Headphones className="w-5 h-5" style={{ color: '#a5b4fc' }} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: 'rgba(165,138,252,0.7)' }}>{t('pod.subtitle')}</span>
          </div>
          <h1 className="font-playfair italic leading-none mb-3"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 4.6rem)', background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.3))' }}>
            Music Podcasts
          </h1>
          <p className="text-xs" style={{ color: 'rgba(140,155,210,0.5)' }}>Slide along the staff · tap a note to enter its space</p>
        </motion.div>

        {/* Staff slider */}
        <div className="relative">
          {/* nav arrows */}
          <button onClick={() => scrollTo(Math.max(0, active - 1))} disabled={active === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scrollTo(Math.min(panelCount - 1, active + 1))} disabled={active === panelCount - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
            <ChevronRight className="w-5 h-5" />
          </button>

          <div ref={trackRef} onScroll={onScroll}
            className="overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
            style={{ scrollbarWidth: 'none' }}>
            <div className="relative flex" style={{ minWidth: 'min-content' }}>
              {/* leading spacer to centre first note */}
              <div className="shrink-0" style={{ width: 'calc(50vw - 230px)', minWidth: 40 }} />

              {/* staff lines — run continuously behind all notes */}
              <div className="absolute inset-x-0 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)', height: 180 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute left-0 right-0" style={{ top: `${20 + i * 20}%`, height: 1, background: 'linear-gradient(90deg, transparent, rgba(165,138,252,0.18) 8%, rgba(165,138,252,0.18) 92%, transparent)' }} />
                ))}
              </div>

              {PODCAST_CATEGORIES.map((cat, i) => {
                const isActive = i === active;
                return (
                  <div key={cat.id} className="snap-center shrink-0 flex flex-col items-center justify-center" style={{ width: 'min(86vw, 460px)' }}>
                    <button onClick={() => navigate(`/podcasts/${cat.id}`)} className="group relative w-full flex flex-col items-center" style={{ minHeight: 260 }}>
                      {/* the note */}
                      <motion.div
                        animate={{ y: isActive ? NOTE_OFFSETS[i] : NOTE_OFFSETS[i] + 4, scale: isActive ? 1 : 0.82, opacity: isActive ? 1 : 0.5 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                        className="relative flex items-center justify-center"
                        style={{ width: 76, height: 76 }}
                      >
                        {/* note head */}
                        <div className="absolute rounded-full" style={{ width: 46, height: 34, left: 6, bottom: 18, background: cat.accent, transform: 'rotate(-22deg)', boxShadow: `0 0 28px ${cat.accent}66` }} />
                        {/* stem */}
                        <div className="absolute" style={{ width: 3, height: 64, right: 12, top: 2, background: cat.accent, borderRadius: 2 }} />
                        {/* flag */}
                        <div className="absolute" style={{ right: 12, top: 2, width: 18, height: 30, background: cat.accent, borderRadius: '0 12px 12px 0', opacity: 0.85, transform: 'skewY(-12deg)' }} />
                      </motion.div>

                      {/* index dot on the staff */}
                      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 6, height: 6, borderRadius: '50%', background: cat.accent, opacity: isActive ? 0.9 : 0.3 }} />

                      {/* label */}
                      <div className="mt-6 text-center px-4">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium block mb-1.5" style={{ color: `${cat.accent}99` }}>
                          {String(i + 1).padStart(2, '0')} · {t(`pod.cat.${cat.id}.tagline`)}
                        </span>
                        <h2 className="font-playfair italic text-2xl leading-none mb-2" style={{ color: isActive ? 'rgba(230,232,255,0.95)' : 'rgba(140,155,210,0.6)' }}>
                          {t(`pod.cat.${cat.id}.label`)}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity group-hover:opacity-100" style={{ color: cat.accent, opacity: isActive ? 0.9 : 0.5 }}>
                          Enter <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* trailing spacer */}
              <div className="shrink-0" style={{ width: 'calc(50vw - 230px)', minWidth: 40 }} />
            </div>
          </div>

          {/* progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {PODCAST_CATEGORIES.map((c, i) => (
              <button key={c.id} onClick={() => scrollTo(i)} className="rounded-full transition-all" style={{ width: i === active ? 22 : 7, height: 7, background: i === active ? c.accent : 'rgba(140,155,210,0.3)' }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}