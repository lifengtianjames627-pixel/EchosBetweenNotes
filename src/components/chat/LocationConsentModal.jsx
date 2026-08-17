import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Check } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Agreement window shown BEFORE the browser permission prompt.
// The user must tick "I have carefully read and agree" and then pick one of:
// Always allow / Only while using / Don't allow.
export default function LocationConsentModal({ V, onChoose, onClose }) {
  const { t } = useLang();
  const [agreed, setAgreed] = useState(false);

  const allowOptions = [
    { id: 'always', label: t('consent.always'), desc: t('consent.alwaysDesc') },
    { id: 'session', label: t('consent.session'), desc: t('consent.sessionDesc') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="w-full max-w-md rounded-2xl p-5 max-h-[90vh] flex flex-col"
        style={{ background: 'rgba(10,13,32,0.98)', border: '1px solid rgba(124,111,255,0.3)', boxShadow: '0 0 50px rgba(124,111,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="flex items-center gap-2 font-playfair italic text-lg" style={{ color: '#e8e9ff' }}>
            <MapPin className="w-4 h-4" style={{ color: V.accent }} /> {t('consent.title')}
          </p>
          <button onClick={onClose} style={{ color: V.muted }}><X className="w-4 h-4" /></button>
        </div>

        {/* Agreement text */}
        <p className="text-xs font-bold uppercase tracking-widest mb-2 shrink-0" style={{ color: V.accent }}>
          {t('consent.agreementTitle')}
        </p>
        <div
          className="overflow-y-auto rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap shrink"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${V.border}`, color: 'rgba(180,195,235,0.8)', maxHeight: '38vh' }}
        >
          {t('consent.agreement')}
        </div>

        {/* Read-and-agree tick */}
        <button
          onClick={() => setAgreed(a => !a)}
          className="flex items-center gap-2.5 mt-3 text-left shrink-0"
        >
          <span
            className="w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-all"
            style={agreed
              ? { background: V.accent, border: `1px solid ${V.accent}` }
              : { background: 'transparent', border: `1.5px solid ${V.muted}` }}
          >
            {agreed && <Check className="w-3 h-3" style={{ color: '#0a0d20' }} />}
          </span>
          <span className="text-xs font-medium" style={{ color: agreed ? '#c4baff' : V.muted }}>
            {t('consent.readAgree')}
          </span>
        </button>
        {!agreed && (
          <p className="text-[10px] mt-1 ml-7 shrink-0" style={{ color: 'rgba(140,155,210,0.4)' }}>{t('consent.checkFirst')}</p>
        )}

        {/* Three choices */}
        <div className="mt-4 space-y-2 shrink-0">
          {allowOptions.map(opt => (
            <button
              key={opt.id}
              disabled={!agreed}
              onClick={() => onChoose(opt.id)}
              className="w-full text-left px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: 'rgba(124,111,255,0.14)',
                border: '1px solid rgba(124,111,255,0.35)',
                opacity: agreed ? 1 : 0.4,
                cursor: agreed ? 'pointer' : 'not-allowed',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: '#c4baff' }}>{opt.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: V.muted }}>{opt.desc}</p>
            </button>
          ))}
          <button
            onClick={() => onChoose('denied')}
            className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${V.border}`, color: V.muted }}
          >
            {t('consent.deny')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}