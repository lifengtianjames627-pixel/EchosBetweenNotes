import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { SERIES_COVERS } from '@/features/podcasts/model/seriesCovers';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
export default function PodcastSeriesCard({ category, index, meta = undefined }) {
  const { t, lang } = useLang(), copy = podcastCopy(lang);
  return <Link to={`/podcasts/${category.id}`} data-testid="podcast-series" className="group block min-w-0 overflow-hidden border border-border bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <img src={SERIES_COVERS[category.id]} alt={t(`pod.cat.${category.id}.label`)} className="aspect-[3/2] w-full object-cover" />
    <div className="space-y-3 border-t border-border p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-accent">{String(index + 1).padStart(2, '0')} · {t(`pod.cat.${category.id}.tagline`)}</p>
      <h3 className="font-playfair text-2xl italic leading-tight">{t(`pod.cat.${category.id}.label`)}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{t(`pod.cat.${category.id}.desc`)}</p>
      <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-xs text-muted-foreground"><span>{meta ? `${meta.count.toLocaleString(lang)} ${copy.episodes}${meta.sum_duration_minutes > 0 ? ` · ${Math.round(meta.sum_duration_minutes).toLocaleString(lang)} ${copy.minutes}` : ''}` : copy.empty}</span><ArrowUpRight className="h-4 w-4 text-accent" /></div>
    </div>
  </Link>;
}