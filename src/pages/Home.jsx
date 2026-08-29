import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Soft inclusive accent set — rotates across the three entry points instead
// of a single dominant neon. Used only for borders, icons, small tints.
const OPTIONS = [
  { path: '/reviews',  icon: PenLine,   labelKey: 'home.reviews',   descKey: 'home.reviewsDesc',   accent: '#7c83b0' },
  { path: '/podcasts', icon: Headphones, labelKey: 'home.podcasts',  descKey: 'home.podcastsDesc',  accent: '#b07a90' },
  { path: '/soulmate', icon: Users,     labelKey: 'home.soulmate',  descKey: 'home.soulmateDesc',  accent: '#b8a07a' },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse 130% 90% at 50% -20%, rgba(107,100,148,0.10) 0%, transparent 55%), radial-gradient(ellipse 100% 70% at 85% 115%, rgba(176,122,144,0.06) 0%, transparent 50%), linear-gradient(180deg, #14161f 0%, #101218 100%)' }}>

      {/* Ambient — diffuse, low-brightness, no neon glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(107,100,148,0.06) 0%, transparent 70%)', transform: 'translate(-35%, -35%)' }} />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(184,160,122,0.04) 0%, transparent 70%)', transform: 'translate(35%, 35%)' }} />
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
            style={{ top: n.top, left: n.left, right: n.right, fontSize: n.size, color: 'rgba(148,144,168,0.16)', lineHeight: 1 }}
            animate={{ y: [-8, 8, -8], opacity: [0.1, 0.22, 0.1] }}
            transition={{ duration: 8, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {n.note}
          </motion.span>
        ))}
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 text-center px-4">
        <motion.h1 className="font-playfair italic leading-none" style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)', color: '#e8e6f0', letterSpacing: '-0.01em' }}>
          Echo Between Notes
        </motion.h1>
        <motion.div className="h-px mt-4 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(107,100,148,0.5), transparent)' }} animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-5 text-base md:text-lg max-w-xl mx-auto" style={{ color: '#9490a8', letterSpacing: '0.01em' }}>
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
            style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
              <Icon className="w-6 h-6" style={{ color: accent }} />
            </div>
            <p className="font-playfair italic text-xl mb-2" style={{ color: '#e8e6f0' }}>{t(labelKey)}</p>
            <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#9490a8' }}>{t(descKey)}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}