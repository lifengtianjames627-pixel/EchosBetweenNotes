import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { LANGUAGES } from '@/i18n/translations';

// Dropdown that switches the SYSTEM language only — user content is untouched.
export default function LanguageButton() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title={t('common.language')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
        style={{ color: 'rgba(160,175,220,0.6)', border: '1px solid rgba(124,111,255,0.15)' }}
      >
        <Globe className="w-3.5 h-3.5" /> {current.flag} {current.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 py-1.5 rounded-2xl z-50 min-w-[160px]"
          style={{ background: 'rgba(10,13,32,0.98)', border: '1px solid rgba(124,111,255,0.3)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-colors hover:bg-white/5"
              style={{ color: l.code === lang ? '#a5b4fc' : 'rgba(180,195,235,0.75)' }}
            >
              <span>{l.flag}</span>
              <span className="flex-1 font-medium">{l.label}</span>
              {l.code === lang && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}