import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, LockKeyhole } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { SERIES_COVERS } from '@/features/podcasts/model/seriesCovers';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
export default function PodcastSeriesHeader({ category, isAdmin, onAdd }) {
  const { t, lang } = useLang(), copy = podcastCopy(lang);
  return <>
    <Link to="/podcasts" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />{copy.back}</Link>
    <header className="mb-8 grid overflow-hidden border bg-card text-card-foreground md:grid-cols-2">
      <img src={SERIES_COVERS[category.id]} alt={t(`pod.cat.${category.id}.label`)} className="h-full min-h-52 w-full object-cover" />
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent">{t(`pod.cat.${category.id}.tagline`)}</p>
        <h1 className="mt-3 font-playfair text-3xl italic leading-tight sm:text-4xl">{t(`pod.cat.${category.id}.label`)}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(`pod.cat.${category.id}.desc`)}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" />{copy.privateLabel}</p>
        {isAdmin && <button onClick={onAdd} className="mt-6 inline-flex w-fit items-center gap-2 border border-foreground px-4 py-2.5 text-xs font-semibold"><Plus className="h-3.5 w-3.5" />{copy.upload}</button>}
      </div>
    </header>
  </>;
}