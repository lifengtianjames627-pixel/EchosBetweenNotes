import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, Headphones, Users } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Three entries — staggered like a sound wave (middle dips), each crowned with
// a small, quiet musical motif instead of a plain hairline.
const OPTIONS = [
  { path: '/reviews',  icon: PenLine,   labelKey: 'home.reviews',   descKey: 'home.reviewsDesc',   motif: 'staff', lift: 'sm:-mt-2' },
  { path: '/podcasts', icon: Headphones, labelKey: 'home.podcasts',  descKey: 'home.podcastsDesc',  motif: 'wave',  lift: 'sm:mt-10' },
  { path: '/soulmate', icon: Users,     labelKey: 'home.soulmate',  descKey: 'home.soulmateDesc',  motif: 'slur',  lift: 'sm:-mt-2' },
];

// Three distinct musical visuals — one per card — so they never read as
// the same icon recolored. Staff fragment, sound wave, tied-note slur.
function Motif({ kind }) {
  const ink = '#bf7a35';
  const op = 0.8;
  if (kind === 'staff') return ( // printed staff with two beamed notes
    <svg width="66" height="38" viewBox="0 0 66 38" fill="none">
      {[10, 16, 22, 28, 34].map(y => (
        <line key={y} x1="2" y1={y} x2="64" y2={y} stroke={ink} strokeWidth="0.7" opacity="0.4" />
      ))}
      <ellipse cx="20" cy="25" rx="4" ry="3" transform="rotate(-20 20 25)" fill={ink} opacity={op} />
      <ellipse cx="44" cy="22" rx="4" ry="3" transform="rotate(-20 44 22)" fill={ink} opacity={op} />
      <path d="M23.5 25 V 9 M47.5 22 V 6" stroke={ink} strokeWidth="1.2" opacity={op} />
      <path d="M23.3 8.6 H 47.3" stroke={ink} strokeWidth="2.2" strokeLinecap="round" opacity={op} />
    </svg>
  );
  if (kind === 'wave') return ( // symmetric sound-wave bars
    <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
      {[[6, 9, 21], [14, 5, 25], [22, 11, 19], [30, 3, 27], [38, 8, 22], [46, 12, 18], [54, 6, 24]].map(([x, y1, y2], i) => (
        <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={ink} strokeWidth="2" strokeLinecap="round" opacity={op} />
      ))}
    </svg>
  );
  if (kind === 'slur') return ( // two notes joined by a slur arc
    <svg width="46" height="40" viewBox="0 0 46 40" fill="none">
      <ellipse cx="9" cy="32" rx="5" ry="3.8" transform="rotate(-20 9 32)" fill={ink} opacity={op} />
      <ellipse cx="34" cy="28" rx="5" ry="3.8" transform="rotate(-20 34 28)" fill={ink} opacity={op} />
      <path d="M13.7 32 V 14 M38.7 28 V 10" stroke={ink} strokeWidth="1.4" opacity={op} />
      <path d="M12 12 Q 25 3 39 7" stroke={ink} strokeWidth="1.3" fill="none" opacity={op} />
    </svg>
  );
  if (kind === 'note') return ( // single eighth note (for scattered decor)
    <svg width="20" height="34" viewBox="0 0 20 34" fill="none">
      <ellipse cx="6" cy="28" rx="5" ry="3.8" transform="rotate(-20 6 28)" fill={ink} opacity={op} />
      <path d="M10.7 28 V 6" stroke={ink} strokeWidth="1.4" opacity={op} />
      <path d="M10.7 6 C 17 8 18.5 14 15 18" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity={op} />
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

// A small treble clef to the left of the title — engraved style.
function Clef() {
  const ink = '#bf7a35';
  return (
    <svg width="30" height="60" viewBox="0 0 30 60" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
      <path d="M15 6 C 9 9 6 16 6 23 C 6 31 13 34 16 30 C 19 26 17 21 13 22 C 10 23 10 28 14 30 C 20 33 25 38 25 46 C 25 53 19 57 13 57 C 9 57 7 54 8 51 C 9 48 13 48 14 51 C 15 54 12 55 10 54" />
      <path d="M15 6 V 52" />
      <circle cx="15" cy="55" r="2.4" fill={ink} stroke="none" opacity="0.7" />
    </svg>
  );
}

// Tiny scattered notes instead of stars — same faint decoration role.
const NOTES = [
  { top: '15%', left: '8%', kind: 'staff' }, { top: '24%', right: '12%', kind: 'wave' },
  { top: '64%', left: '14%', kind: 'slur' }, { top: '72%', right: '8%', kind: 'note' },
  { top: '46%', left: '52%', kind: 'wave' },
];
function FloatNote({ kind }) {
  return (
    <span className="block opacity-[0.12]" style={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
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
        <div className="relative inline-flex items-end gap-4">
          {/* Five staff lines running through the title — same ochre as the clef */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {[10, 27.5, 45, 62.5, 80].map(y => (
                <path key={y} d={`M0 ${y} Q 25 ${y - 12} 50 ${y} T 100 ${y}`} stroke="#bf7a35" strokeWidth="1" fill="none" opacity="0.6" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <span className="hidden sm:block mb-2 relative z-10"><Clef /></span>
          <h1 className="relative z-10 font-playfair italic leading-none text-center" style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)', color: '#1a1815', letterSpacing: '-0.01em' }}>
            <span style={{ display: 'inline-block', transform: 'translateY(-10px)' }}>Echo</span>{' '}
            <span style={{ display: 'inline-block', transform: 'translateY(7px)' }}>Between</span>{' '}
            <span style={{ display: 'inline-block', transform: 'translateY(-8px)' }}>Notes</span>
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