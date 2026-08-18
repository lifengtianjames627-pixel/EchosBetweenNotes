import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// High-accuracy location. Instead of a single one-shot reading, we watch the
// device fix for up to 20s with enableHighAccuracy and keep the BEST sample.
// A fix is only accepted and saved when its reported error is ≤ 500 m —
// anything worse is rejected as "imprecise" rather than silently stored wrong.
// GPS is satellite-based, so a VPN cannot distort it — only the network address
// changes, never the device fix. Coordinates are saved at full precision (~1 m);
// other people only ever see a ~100 m-coarse pin and rounded distances.

const MAX_ERROR_M = 500;      // reject fixes worse than this
const GOOD_ENOUGH_M = 60;     // stop sampling early once we're this precise
const SAMPLE_WINDOW_MS = 20000;

export function useMyLocation() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('idle'); // idle | asking | done | denied | unsupported | imprecise
  const [accuracy, setAccuracy] = useState(null); // live best accuracy in metres
  const watchRef = useRef(null);
  const timerRef = useRef(null);

  const stopWatching = () => {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const save = async (best, consent) => {
    await base44.auth.updateMe({
      location_lat: Math.round(best.lat * 100000) / 100000,
      location_lng: Math.round(best.lng * 100000) / 100000,
      location_accuracy_m: Math.round(best.acc),
      location_consent: consent,
      location_updated: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
  };

  // consent: 'always' (auto-refresh on future visits) | 'session' (this visit only)
  const share = useCallback((consent = 'session') => {
    if (!navigator.geolocation) { setStatus('unsupported'); return; }
    stopWatching();
    setStatus('asking');
    setAccuracy(null);

    let best = null;

    const finish = async () => {
      stopWatching();
      if (!best) { setStatus('denied'); return; }
      if (best.acc <= MAX_ERROR_M) {
        await save(best, consent);
        setAccuracy(Math.round(best.acc));
        setStatus('done');
      } else {
        setAccuracy(Math.round(best.acc));
        setStatus('imprecise');
      }
    };

    timerRef.current = setTimeout(finish, SAMPLE_WINDOW_MS);

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        if (!best || acc < best.acc) {
          best = { lat: latitude, lng: longitude, acc };
          setAccuracy(Math.round(acc));
        }
        if (acc <= GOOD_ENOUGH_M) finish(); // precise enough — no need to keep sampling
      },
      (err) => {
        stopWatching();
        setStatus(err.code === 1 ? 'denied' : best ? 'imprecise' : 'denied');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: SAMPLE_WINDOW_MS }
    );
  }, []);

  // Manual correction: the user placed the pin themselves on the map, so the
  // position is exact by definition — no browser estimate involved.
  const setManual = useCallback(async ([lat, lng]) => {
    stopWatching();
    await base44.auth.updateMe({
      location_lat: Math.round(lat * 100000) / 100000,
      location_lng: Math.round(lng * 100000) / 100000,
      location_accuracy_m: 0,
      location_source: 'manual',
      location_consent: 'always',
      location_updated: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
    setStatus('done');
  }, [queryClient]);

  // User picked "Don't allow" in the agreement window — remember it.
  const deny = useCallback(async () => {
    await base44.auth.updateMe({ location_consent: 'denied', location_lat: null, location_lng: null, location_accuracy_m: null });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
    setStatus('idle');
  }, [queryClient]);

  const clear = useCallback(async () => {
    stopWatching();
    await base44.auth.updateMe({ location_lat: null, location_lng: null, location_accuracy_m: null, location_consent: null, location_updated: null, location_source: null });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
    setStatus('idle');
  }, [queryClient]);

  return { status, accuracy, share, deny, clear, setManual };
}