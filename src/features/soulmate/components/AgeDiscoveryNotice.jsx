import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import recruitCopy from '@/features/soulmate/i18n/recruitCopy';
export default function AgeDiscoveryNotice() {
  const { lang } = useLang();
  const copy = recruitCopy(lang);
  return <div className="rounded-xl border bg-card p-4 text-card-foreground">
    <p className="text-sm text-muted-foreground">{copy.ageHint}</p>
    <Link to="/soulmate" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{copy.ageTitle}</Link>
  </div>;
}