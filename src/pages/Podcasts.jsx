import React from 'react';
import { Headphones } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import PodcastEditorialStrip from '@/components/podcasts/PodcastEditorialStrip';
import PodcastSeriesCard from '@/features/podcasts/components/PodcastSeriesCard';
import { usePodcastTotals } from '@/features/podcasts/queries/usePodcastData';
import { useLang } from '@/i18n/LanguageContext';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';

export default function Podcasts() {
  const { t, lang } = useLang(), copy = podcastCopy(lang);
  const totals = usePodcastTotals();
  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 border-b border-border pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{copy.letter}</p>
        <h1 className="mt-3 font-playfair text-4xl italic sm:text-6xl">Music Podcasts</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{t('pod.subtitle')}</p>
      </header>
      <h2 className="mb-6 flex items-center gap-3 font-playfair text-2xl italic"><Headphones className="h-5 w-5 text-accent" />{copy.series}</h2>
      {totals.isLoading && <p role="status" className="mb-4 text-xs text-muted-foreground">{copy.loading}</p>}
      {totals.isError && <button onClick={() => totals.refetch()} className="mb-4 text-sm text-accent underline">{copy.retry}</button>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PODCAST_CATEGORIES.map((category, index) => <PodcastSeriesCard key={category.id} category={category} index={index} meta={totals.data?.rows.find(row => row.category === category.id)} />)}
      </div>
      <PodcastEditorialStrip />
    </div>
  </div>;
}