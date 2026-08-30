import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Three entries — staggered like a sound wave (middle dips), each crowned with
// a small, quiet musical motif instead of a plain hairline.
const OPTIONS = [
  { path: '/reviews',  icon: PenLine,   labelKey: 'home.reviews',   descKey: 'home.reviewsDesc',   motif: 'wave',  lift: 'sm:-mt-2' },
  { path: '/podcasts', icon: Headphones, labelKey: 'home.podcasts',  descKey: 'home.podcastsDesc',  motif: 'note',  lift: 'sm:mt-10' },
  { path: '/soulmate', icon: Users,     labelKey: 'home.soulmate',  descKey: 'home.soulmateDesc',  motif: 'bars',  lift: 'sm:-mt-2' },
];

// Quiet musical motifs — single ochre hairline, no fill, no glow.
function Motif({ kind }) {
  const s = { stroke: '#bf7a35', fill: 'none', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'wave') return (
    <svg width="72" height="18" viewBox="0 0 72 18" {...s}>
      <path d="M2 9 Q 9 1 16 9 T 30 9 T 44 9 T 58 9 T 70 9" opacity="0.7" />
    </svg>
  );
  if (kind === 'note') return (
    <svg width="22" height="30" viewBox="0 0 22 30" {...s}>
      <path d="M8 24 a4.5 4.5 0 1 0 4.5 -4.5 V5 L18 7" opacity="0.7" />
      <circle cx="8" cy="24" r="4.5" opacity="0.7" />
    </svg>
  );
  if (kind === 'bars') return (
    <svg width="56" height="18" viewBox="0 0 56 18" {...s}>
      <path d="M3 15 V7 M11 15 V3 M19 15 V10 M27 15 V5 M35 15 V12 M43 15 V6 M51 15 V9" strokeWidth="2" opacity="0.7" />
    </svg>
  );
  return null;
}

// Faint five-line staff behind the hero — the "music paper" texture. Barely
// there, so it reads as paper grain rather than a graphic.
function StaffLines() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {[20, 35, 50, 65, 80].map(y => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#bf7a35" strokeWidth="0.18" opacity="0.1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// A small treble-clef-ish flourish to the left of the title.
function Clef() {
  return (
    <svg width="34" height="56" viewBox="0 0 34 56" fill="none" stroke="#bf7a35" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
      <path d="M17 6 C 10 12 10 22 17 26 C 25 30 25 40 17 44 C 12 47 9 44 11 40 C 13 36 19 36 21 40" />
      <path d="M17 26 V 50" />
      <circle cx="17" cy="50" r="2.5" fill="#bf7a35" stroke="none" opacity="0.7" />
    </svg>
  );
}

// Tiny scattered notes instead of stars — same faint decoration role.
const NOTES = [
  { top: '15%', left: '8%', kind: 'note' }, { top: '24%', right: '12%', kind: 'wave' },
  { top: '64%', left: '14%', kind: 'bars' }, { top: '72%', right: '8%', kind: 'note' },
  { top: '46%', left: '52%', kind: 'wave' },
];
function FloatNote({ kind }) {
  const scale = kind === 'note' ? 0.7 : kind === 'bars' ? 0.8 : 0.7;
  return (
    <span className="block opacity-[0.13]" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <Motif kind={kind} />
    </span>
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
        <div className="absolute inset-0" style={{ background: 'rgba(243,239,230,0.8)' }} />
      </div>

      {/* Faint staff lines across the upper page */}
      <div className="absolute inset-x-0 top-[8%] h-[42%] z-0 pointer-events-none">
        <StaffLines />
      </div>

      {/* Scattered faint notes */}
      {NOTES.map((n, i) => (
        <span key={i} className="absolute z-0 pointer-events-none" style={{ ...n }}>
          <FloatNote kind={n.kind} />
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-24 min-h-[calc(100vh-3.5rem)]">
        <div className="flex items-end gap-4">
          <span className="hidden sm:block mb-2"><Clef /></span>
          <h1 className="font-playfair italic leading-none text-center" style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)', color: '#1a1815', letterSpacing: '-0.01em' }}>
            Echo Between Notes
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <span className="h-px w-12" style={{ background: '#bf7a35', opacity: 0.6 }} />
          <span className="block"><Motif kind="note" /></span>
          <span className="h-px w-12" style={{ background: '#bf7a35', opacity: 0.6 }} />
        </div>
        <p className="mt-5 text-base md:text-lg max-w-xl text-center" style={{ color: '#5a534a' }}>
          {t('home.tagline')}
        </p>

        {/* Three paper cards — staggered like a sound wave */}
        <div className="mt-16 flex flex-col sm:flex-row sm:items-end justify-center gap-6 w-full max-w-4xl">
          {OPTIONS.map(({ path, icon: Icon, labelKey, descKey, motif, lift }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group flex flex-col items-center text-center px-6 py-9 transition-all duration-300 hover:-translate-y-1 ${lift} flex-1`}
              style={{ '--card-accent': '#bf7a35', background: '#faf8f2', border: '1px solid #e0d8c8', borderRadius: 12, boxShadow: '0 2px 14px rgba(120,100,80,0.06)' }}
            >
              <div className="mb-5 opacity-70 transition-opacity group-hover:opacity-100">
                <Motif kind={motif} />
              </div>
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