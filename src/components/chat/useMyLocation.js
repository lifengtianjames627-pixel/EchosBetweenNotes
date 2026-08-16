import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Real distance between people comes from the device's own location (the browser
// Geolocation API), so no paid Google/Apple Maps key is involved. Coordinates are
// rounded to ~100m before being saved and are never shown to other users — only a
// distance in km is.
export function useMyLocation() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('idle'); // idle | asking | done | denied | unsupported

  const share = () => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await base44.auth.updateMe({
          location_lat: Math.round(pos.coords.latitude * 1000) / 1000,
          location_lng: Math.round(pos.coords.longitude * 1000) / 1000,
          location_updated: new Date().toISOString(),
        });
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
        setStatus('done');
      },
      () => setStatus('denied'),
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const clear = async () => {
    await base44.auth.updateMe({ location_lat: null, location_lng: null, location_updated: null });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
    setStatus('idle');
  };

  return { status, share, clear };
}