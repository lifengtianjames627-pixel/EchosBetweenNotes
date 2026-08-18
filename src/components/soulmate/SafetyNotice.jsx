import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Always-visible safety framing for the band-forming board.
// Chordmates only displays information and carries messages — it never arranges,
// verifies, endorses, or takes part in anything that happens offline.
export default function SafetyNotice({ compact = false }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.22)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#a5b4fc' }} />
        <p className="text-xs font-semibold flex-1" style={{ color: 'rgba(200,210,245,0.85)' }}>
          {t('sm.safety.title')}
        </p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(140,155,210,0.6)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 text-xs leading-relaxed" style={{ color: 'rgba(150,165,215,0.72)' }}>
              {[1, 2, 3, 4].map(n => (
                <p key={n}>
                  <span style={{ color: '#c4baff' }}>{t(`sm.safety.k${n}`)}</span> {t(`sm.safety.b${n}`)}
                </p>
              ))}
              {!compact && (
                <p className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(124,111,255,0.15)', color: 'rgba(140,155,210,0.55)' }}>
                  {t('sm.safety.legal')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}