import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Three entry cards — unified ochre accent (same as Written Reviews) for the
// top hairline + hover icon tint, so every card lights up identically on hover.
const OPTIONS = [
  { path: '/reviews',  icon: PenLine,   labelKey: 'home.reviews',   descKey: 'home.reviewsDesc',   accent: '#bf7a35' },
  { path: '/podcasts', icon: Headphones, labelKey: 'home.podcasts',  descKey: 'home.podcastsDesc',  accent: '#bf7a35' },
  { path: '/soulmate', icon: Users,     labelKey: 'home.soulmate',  descKey: 'home.soulmateDesc',  accent: '#bf7a35' },
];

// Faint hand-drawn stars — the only decoration, barely visible.
const STARS = [
  { top: '16%', left: '10%' }, { top: '28%', right: '14%' }, { top: '60%', left: '16%' },
  { top: '70%', right: '10%' }, { top: '42%', left: '48%' },
];
function Star() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6-6.3 4.6L7 13.8 1 9.4h7.6z" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Layer 1 — blurred ambient music scene (the "world" behind the paper) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: 'blur(30px) saturate(0.6) brightness(1.04)', transform: 'scale(1.12)' }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(243,239,230,0.78)' }} />
      </div>

      {/* Faint stars */}
      {STARS.map((s, i) => (
        <span key={i} className="absolute z-0 pointer-events-none" style={{ ...s, color: 'rgba(191,122,53,0.16)' }}>
          <Star />
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-24 min-h-[calc(100vh-3.5rem)]">
        <h1 className="font-playfair italic leading-none text-center" style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)', color: '#1a1815', letterSpacing: '-0.01em' }}>
          Echo Between Notes
        </h1>
        <div className="h-px w-40 mt-5" style={{ background: '#bf7a35' }} />
        <p className="mt-5 text-base md:text-lg max-w-xl text-center" style={{ color: '#5a534a' }}>
          {t('home.tagline')}
        </p>

        {/* Three paper cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {OPTIONS.map(({ path, icon: Icon, labelKey, descKey, accent }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex flex-col items-center text-center px-6 py-9 transition-colors"
              style={{ '--card-accent': accent, background: '#faf8f2', border: '1px solid #e0d8c8', borderRadius: 12, boxShadow: '0 2px 14px rgba(120,100,80,0.06)' }}
            >
              <div className="w-full h-px mb-6" style={{ background: accent, opacity: 0.55 }} />
              <Icon className="w-7 h-7 mb-4 transition-colors text-[#8a7e6f] group-hover:text-[color:var(--card-accent)]" />
              <p className="font-playfair italic text-xl mb-2" style={{ color: '#1a1815' }}>{t(labelKey)}</p>
              <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#6b6358' }}>{t(descKey)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}