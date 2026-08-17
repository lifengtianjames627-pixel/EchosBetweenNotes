import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Navigation, LocateFixed, ShieldCheck, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMyLocation } from './useMyLocation';
import { useLang } from '@/i18n/LanguageContext';
import LocationConsentModal from './LocationConsentModal';

// Distance-sorting control for "People around you".
// Opens the agreement window first; only after the user agrees and picks
// Always / While-using does the browser permission prompt appear.
export default function LocationShareBar({ V, located }) {
  const { t } = useLang();
  const { status, accuracy, share, deny, clear } = useMyLocation();
  const [showConsent, setShowConsent] = useState(false);
  const autoTried = useRef(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  // "Always allow" → silently refresh the fix on every visit, no re-asking.
  useEffect(() => {
    if (user?.location_consent === 'always' && !located && status === 'idle' && !autoTried.current) {
      autoTried.current = true;
      share('always');
    }
  }, [user, located, status, share]);

  const choose = (choice) => {
    setShowConsent(false);
    if (choice === 'denied') deny();
    else share(choice);
  };

  if (located) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-1.5"
        style={{ background: 'rgba(124,111,255,0.08)', border: `1px solid ${V.border}` }}>
        <LocateFixed className="w-3.5 h-3.5 shrink-0" style={{ color: V.accent }} />
        <p className="text-[11px] flex-1" style={{ color: V.muted }}>
          {t('loc.sorted')}{user?.location_accuracy_m ? ` ${t('loc.accuracy', { m: user.location_accuracy_m })}` : ''}
        </p>
        <button onClick={clear} className="text-[11px] shrink-0 underline" style={{ color: V.muted }}>
          {t('loc.turnOff')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-3 rounded-2xl mb-1.5"
        style={{ background: 'rgba(255,255,255,0.03)', border: `1px dashed ${V.border}` }}>
        {status === 'imprecise' ? (
          <>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed" style={{ color: '#fbbf24' }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {t('loc.imprecise', { m: accuracy ?? '—' })}
            </p>
            <button
              onClick={() => share(user?.location_consent === 'always' ? 'always' : 'session')}
              className="text-xs font-semibold mt-2 underline" style={{ color: V.accent }}>
              {t('loc.retry')}
            </button>
          </>
        ) : user?.location_consent === 'denied' && status === 'idle' ? (
          <p className="text-[11px] leading-relaxed" style={{ color: V.muted }}>
            {t('loc.deniedChoice')}{' '}
            <button onClick={() => setShowConsent(true)} className="underline font-semibold" style={{ color: V.accent }}>
              {t('loc.change')}
            </button>
          </p>
        ) : (
          <>
            <button
              onClick={() => setShowConsent(true)}
              disabled={status === 'asking'}
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: V.accent, opacity: status === 'asking' ? 0.6 : 1 }}
            >
              <Navigation className={`w-3.5 h-3.5 ${status === 'asking' ? 'animate-pulse' : ''}`} />
              {status === 'asking'
                ? (accuracy !== null ? t('loc.locating', { m: accuracy }) : t('loc.locatingStart'))
                : t('loc.use')}
            </button>
            <p className="flex items-start gap-1.5 text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(140,155,210,0.5)' }}>
              <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
              {status === 'denied' ? t('loc.blocked')
                : status === 'unsupported' ? t('loc.unsupported')
                : t('loc.privacy')}
            </p>
          </>
        )}
      </div>

      <AnimatePresence>
        {showConsent && (
          <LocationConsentModal V={V} onChoose={choose} onClose={() => setShowConsent(false)} />
        )}
      </AnimatePresence>
    </>
  );
}