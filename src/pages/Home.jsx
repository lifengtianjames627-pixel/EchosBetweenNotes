import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Cross-cultural soft accent set — rotates across the three entry points so
// no single color dominates. Earthy, warm, friendly: indigo (ink), terracotta,
// sage. Used for icons, borders, small tints on the warm paper base.
const OPTIONS = [
  { path: '/reviews',  icon: PenLine,   labelKey: 'home.reviews',   descKey: 'home.reviewsDesc',   accent: '#5a6a8a' },
  { path: '/podcasts', icon: Headphones, labelKey: 'home.podcasts',  descKey: 'home.podcastsDesc',  accent: '#b06547' },
  { path: '/soulmate', icon: Users,     labelKey: 'home.soulmate',  descKey: 'home.soulmateDesc',  accent: '#7a8a6a' },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse 130% 90% at 50% -15%, rgba(201,165,88,0.14) 0%, transparent 55%), radial-gradient(ellipse 100% 70% at 85% 120%, rgba(176,101,71,0.08) 0%, transparent 50%), linear-gradient(180deg, #f7f3ec 0%, #efe9dd 100%)' }}>

      {/* Ambient — warm, diffuse, paper-like; no neon */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,165,88,0.10) 0%, transparent 70%)', transform: 'translate(-35%, -35%)' }} />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(122,138,106,0.08) 0%, transparent 70%)', transform: 'translate(35%, 35%)' }} />
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
            style={{ top: n.top, left: n.left, right: n.right, fontSize: n.size, color: 'rgba(107,99,88,0.14)', lineHeight: 1 }}
            animate={{ y: [-8, 8, -8], opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 8, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {n.note}
          </motion.span>
        ))}
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 text-center px-4">
        <motion.h1 className="font-playfair italic leading-none" style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)', color: '#2b2620', letterSpacing: '-0.01em' }}>
          Echo Between Notes
        </motion.h1>
        <motion.div className="h-px mt-4 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(176,101,71,0.45), transparent)' }} animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-5 text-base md:text-lg max-w-xl mx-auto" style={{ color: '#6b6358', letterSpacing: '0.01em' }}>
          {t('home.tagline')}
        </motion.p>
      </motion.div>

      {/* Three paths */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="relative z-10 mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {OPTIONS.map(({ path, icon: Icon, labelKey, descKey, accent }) => (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center text-center px-6 py-10 rounded-3xl transition-colors"
            style={{ background: '#fbf8f2', border: `1px solid ${accent}33`, boxShadow: '0 10px 30px rgba(120,100,80,0.08)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
              <Icon className="w-6 h-6" style={{ color: accent }} />
            </div>
            <p className="font-playfair italic text-xl mb-2" style={{ color: '#2b2620' }}>{t(labelKey)}</p>
            <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#6b6358' }}>{t(descKey)}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}