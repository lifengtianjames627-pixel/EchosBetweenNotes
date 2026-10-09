import React from 'react';
import { useLang } from '@/i18n/LanguageContext';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
import { SERIES_COVERS } from '@/features/podcasts/model/seriesCovers';
export default function PodcastEditorialStrip() {
  const { lang } = useLang(), copy = podcastCopy(lang);
  return <section className="mt-12 grid overflow-hidden border border-border bg-card text-card-foreground md:grid-cols-2">
    <img src={SERIES_COVERS.behind_the_lyrics} alt="" className="h-60 w-full object-cover md:h-full" />
    <div className="flex flex-col justify-center p-7 sm:p-10">
      <p className="text-[10px] uppercase tracking-[0.2em] text-accent">{copy.letter}</p>
      <h2 className="mt-3 font-playfair text-3xl italic leading-tight">{copy.editorialTitle}</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{copy.editorialBody}</p>
    </div>
  </section>;
}