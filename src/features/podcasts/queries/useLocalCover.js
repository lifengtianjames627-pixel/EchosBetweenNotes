import { useEffect, useState } from 'react';
export default function useLocalCover(copy) {
  const [file, setFile] = useState(/** @type {File | null} */ (null));
  const [url, setUrl] = useState(''), [error, setError] = useState(''), [ready, setReady] = useState(true);
  useEffect(() => { if (!file) { setUrl(''); return; } const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next); }, [file]);
  const clear = () => { setFile(null); setError(''); setReady(true); };
  const select = (/** @type {File | undefined} */ selected) => {
    clear(); if (!selected) return;
    setReady(false);
    if (!/\.(png|jpe?g|webp)$/i.test(selected.name) || !selected.size || selected.size > 5 * 1024 * 1024) { setError(copy.coverInvalid); return; }
    setFile(selected);
  };
  return { file, url, error, ready, select, clear, loaded: () => setReady(true), failed: () => { setReady(false); setError(copy.coverInvalid); } };
}