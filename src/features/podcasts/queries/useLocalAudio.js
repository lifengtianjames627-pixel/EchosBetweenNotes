import { useEffect, useState } from 'react';
export default function useLocalAudio(copy) {
  const [file, setFile] = useState(/** @type {File | null} */ (null));
  const [url, setUrl] = useState(''), [error, setError] = useState('');
  const [ready, setReady] = useState(false), [minutes, setMinutes] = useState(0);
  useEffect(() => { if (!file) { setUrl(''); return; } const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next); }, [file]);
  const select = selected => {
    setReady(false); setMinutes(0); setError(''); setFile(null);
    if (!selected) return;
    if (!/\.(wav|mp3|m4a|aac|ogg|opus|flac|webm)$/i.test(selected.name) || !selected.size || selected.size > 1024 * 1024 * 1024) { setError(copy.invalid); return; }
    setFile(selected);
  };
  const loaded = audio => { if (Number.isFinite(audio.duration) && audio.duration > 0) { setReady(true); setMinutes(audio.duration / 60); } else setError(copy.unsupported); };
  const failed = () => { setReady(false); setError(copy.unsupported); };
  return { file, url, error, ready, minutes, select, loaded, failed };
}