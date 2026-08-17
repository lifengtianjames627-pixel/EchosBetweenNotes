import { useState, useCallback } from 'react';
import { TRANSLATIONS } from '@/i18n/translations';

// Independent language setting for the Written Reviews area.
// Deliberately NOT tied to the system language — changing one never moves the other.
export function useReviewsLanguage() {
  const [rlang, setRlangState] = useState(() => localStorage.getItem('reviews_lang') || 'en');

  const setRlang = useCallback((code) => {
    localStorage.setItem('reviews_lang', code);
    setRlangState(code);
  }, []);

  const rt = useCallback((key, vars) => {
    let str = TRANSLATIONS[rlang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v);
    return str;
  }, [rlang]);

  return { rlang, setRlang, rt };
}