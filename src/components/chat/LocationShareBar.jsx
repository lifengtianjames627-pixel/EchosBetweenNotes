import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Navigation, LocateFixed, ShieldCheck, AlertTriangle, Crosshair } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMyLocation } from './useMyLocation';
import { useLang } from '@/i18n/LanguageContext';
import LocationConsentModal from './LocationConsentModal';
import LocationPicker from './LocationPicker';

// Distance-sorting control for "People around you".
// Two paths to a position: the device fix (accurate on phones with GPS) and
// manual pin placement on a map — the only exact option on a laptop, where the
// browser can merely estimate from Wi-Fi.
export default function LocationShareBar({ V, located, locationSource, myLat, myLng }) {
  const { t } = useLang();
  const { status, accuracy, share, deny, clear, setManual } = useMyLocation();
  const [showConsent, setShowConsent] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const autoTried = useRef(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  // Touch device ⇒ almost certainly a phone/tablet with a GPS chip.
  const hasGps = typeof window !== 'undefined'
    && window.matchMedia?.('(pointer: coarse)').matches
    && !!navigator.geolocation;
  const manual = user?.location_source === 'manual';
  const pickerCenter = typeof user?.location_lat === 'number'
    ? [user.location_lat, user.location_lng]
    : (typeof myLat === 'number' && typeof myLng === 'number' ? [myLat, myLng] : null);

  // "Always allow" → silently refresh the fix on every visit, no re-asking.
  // A hand-placed pin is never overwritten by a coarse browser estimate.
  useEffect(() => {
    if (user?.location_consent === 'always' && !manual && !located && status === 'idle' && !autoTried.current) {
      autoTried.current = true;
      share('always');
    }
  }, [user, manual, located, status, share]);

  const choose = (choice) => {
    setShowConsent(false);
    if (choice === 'denied') deny();
    else share(choice);
  };

  const pickerNode = (
    <AnimatePresence>
      {showPicker && (
        <LocationPicker
          V={V}
          initialCenter={pickerCenter}
          onConfirm={(pin) => { setShowPicker(false); setManual(pin); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </AnimatePresence>
  );

  if (located) {
    const isIp = locationSource === 'ip';
    return (
      <>
        {/* Compact one-line status: the position is on, and the things you can do
            about it. An IP-derived spot is approximate — placing a pin refines it. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 rounded-2xl mb-1.5"
          style={{ background: '#f6efe1', border: `1px solid ${V.border}` }}>
          <span
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: V.muted }}
            title={manual ? t('loc.manualSet') : (user?.location_accuracy_m ? t('loc.accuracy', { m: user.location_accuracy_m }) : '')}
          >
            <LocateFixed className="w-3.5 h-3.5 shrink-0" style={{ color: V.accent }} />
            {isIp ? t('loc.approxNetwork') : t('loc.sortedShort')}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold underline"
              style={{ color: V.accent }}
            >
              <Crosshair className="w-3 h-3" /> {isIp ? t('loc.placePin') : t('loc.adjust')}
            </button>
            {/* Phones have a real GPS chip, so re-running the fix there genuinely
                improves accuracy — offered only on touch devices. */}
            {hasGps && (
              <button
                onClick={() => share(user?.location_consent === 'always' ? 'always' : 'session')}
                disabled={status === 'asking'}
                className="flex items-center gap-1.5 text-[11px] font-semibold underline"
                style={{ color: V.accent, opacity: status === 'asking' ? 0.6 : 1 }}
              >
                <Navigation className={`w-3 h-3 ${status === 'asking' ? 'animate-pulse' : ''}`} />
                {status === 'asking'
                  ? (accuracy !== null ? t('loc.locating', { m: accuracy }) : t('loc.locatingStart'))
                  : (isIp ? t('loc.useGps') : t('chat.gpsRefresh'))}
              </button>
            )}
            {!isIp && (
              <button onClick={clear} className="text-[11px] shrink-0 underline" style={{ color: V.muted }}>
                {t('loc.turnOff')}
              </button>
            )}
          </div>
        </div>
        {pickerNode}
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-3 rounded-2xl mb-1.5"
        style={{ background: V.card, border: `1px dashed ${V.border}` }}>
        {status === 'imprecise' ? (
          <>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed" style={{ color: '#a0522d' }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {t('loc.imprecise', { m: accuracy ?? '—' })}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                onClick={() => share(user?.location_consent === 'always' ? 'always' : 'session')}
                className="text-xs font-semibold underline" style={{ color: V.accent }}>
                {t('loc.retry')}
              </button>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 text-xs font-semibold underline" style={{ color: V.accent }}>
                <Crosshair className="w-3 h-3" /> {t('loc.manual')}
              </button>
            </div>
          </>
        ) : user?.location_consent === 'denied' && status === 'idle' ? (
          <>
            <p className="text-[11px] leading-relaxed" style={{ color: V.muted }}>
              {t('loc.deniedChoice')}{' '}
              <button onClick={() => setShowConsent(true)} className="underline font-semibold" style={{ color: V.accent }}>
                {t('loc.change')}
              </button>
            </p>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold mt-2 underline" style={{ color: V.accent }}>
              <Crosshair className="w-3 h-3" /> {t('loc.manual')}
            </button>
          </>
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
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold mt-2 underline"
              style={{ color: V.accent }}
            >
              <Crosshair className="w-3 h-3" /> {t('loc.manual')}
            </button>
            <p className="flex items-start gap-1.5 text-[10px] mt-2 leading-relaxed" style={{ color: '#8a7e6f' }}>
              <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
              {status === 'denied' ? t('loc.blocked')
                : status === 'unsupported' ? t('loc.unsupported')
                : t('loc.desktopHint')}
            </p>
          </>
        )}
      </div>
      {pickerNode}
    </>
  );
}