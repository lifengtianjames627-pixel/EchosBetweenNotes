import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

const OPTIONS = [
  {
    path: '/reviews',
    icon: PenLine,
    labelKey: 'home.reviews',
    descKey: 'home.reviewsDesc',
    accent: '#7c6fff',
    glow: 'rgba(124,111,255,0.4)',
  },
  {
    path: '/podcasts',
    icon: Headphones,
    labelKey: 'home.podcasts',
    descKey: 'home.podcastsDesc',
    accent: '#f472b6',
    glow: 'rgba(244,114,182,0.4)',
  },
  {
    path: '/soulmate',
    icon: Users,
    labelKey: 'home.soulmate',
    descKey: 'home.soulmateDesc',
    accent: '#c084fc',
    glow: 'rgba(192,132,252,0.4)',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* Ambient background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)', transform: 'translate(-40%, -40%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(165,138,252,0.10) 0%, transparent 65%)', transform: 'translate(40%, 40%)' }} />

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
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1
          className="font-playfair italic leading-none"
          style={{
            fontSize: 'clamp(2.6rem, 8vw, 6rem)',
            background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
            filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.4))',
          }}
        >
          Echo Between Notes
        </motion.h1>
        <motion.div
          className="h-px mt-4 mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, #7c6fff, #c084fc, #f472b6, transparent)', originX: 0.5 }}
          animate={{ scaleX: [0.5, 1, 0.7, 1, 0.5], opacity: [0.4, 1, 0.6, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 text-base md:text-lg max-w-xl mx-auto"
          style={{ color: 'rgba(160,175,215,0.7)', letterSpacing: '0.01em' }}
        >
          {t('home.tagline')}
        </motion.p>
      </motion.div>

      {/* Two paths */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="relative z-10 mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl"
      >
        {OPTIONS.filter(o => o.path !== '/soulmate' || isAuthenticated).map(({ path, icon: Icon, labelKey, descKey, accent, glow }) => (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center text-center px-6 py-10 rounded-3xl transition-all"
            style={{
              background: `${accent}12`,
              border: `1px solid ${accent}35`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: `0 0 40px ${glow}22`,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: `${accent}20`, border: `1px solid ${accent}45` }}
            >
              <Icon className="w-6 h-6" style={{ color: accent, filter: `drop-shadow(0 0 8px ${glow})` }} />
            </div>
            <p className="font-playfair italic text-xl mb-2" style={{ color: '#e8e9ff' }}>{t(labelKey)}</p>
            <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: 'rgba(160,175,215,0.6)' }}>{t(descKey)}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}