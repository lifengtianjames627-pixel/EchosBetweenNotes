import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import { PODCAST_CATEGORY_MAP } from '@/lib/podcastConfig';
import AddPodcastModal from '@/components/AddPodcastModal';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/i18n/LanguageContext';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
import { usePodcastEpisodes, usePublishPodcast } from '@/features/podcasts/queries/usePodcastData';
import PodcastSeriesHeader from '@/features/podcasts/components/PodcastSeriesHeader';
import PodcastEpisodeCard from '@/features/podcasts/components/PodcastEpisodeCard';

export default function PodcastSpace() {
  const { categoryId } = useParams(), { user } = useAuth(), { lang } = useLang();
  const category = PODCAST_CATEGORY_MAP[categoryId], copy = podcastCopy(lang);
  const [addOpen, setAddOpen] = useState(false);
  const episodes = usePodcastEpisodes(category?.id);
  const publish = usePublishPodcast(() => setAddOpen(false));
  if (!category) return <div className="min-h-screen bg-background p-12 text-foreground"><h1 className="font-playfair text-2xl italic">{copy.unknown}</h1><Link to="/podcasts" className="mt-4 block text-accent underline">{copy.back}</Link></div>;
  const items = episodes.data?.pages.flatMap(page => page.items) || [];
  return <div className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
    <PodcastSeriesHeader category={category} isAdmin={user?.role === 'admin'} onAdd={() => setAddOpen(true)} />
    {episodes.isLoading ? <p role="status" className="py-12 text-center text-muted-foreground">{copy.loading}</p> : episodes.isError ? <button onClick={() => episodes.refetch()} className="text-accent underline">{copy.retry}</button> : items.length === 0 ? <div className="flex flex-col items-center border border-dashed bg-card py-14 text-muted-foreground"><Headphones className="mb-3 h-7 w-7 text-accent" /><p className="font-playfair text-lg italic">{copy.empty}</p></div> : <div className="space-y-4">{items.map(episode => <PodcastEpisodeCard key={episode.id} episode={episode} />)}</div>}
    {episodes.hasNextPage && <button disabled={episodes.isFetchingNextPage} onClick={() => episodes.fetchNextPage()} className="mt-6 border bg-card px-5 py-2 text-sm disabled:opacity-50">{episodes.isFetchingNextPage ? copy.loading : copy.more}</button>}
    {addOpen && user?.role === 'admin' && <AddPodcastModal defaultCategory={category.id} onClose={() => setAddOpen(false)} onSubmit={data => publish.mutateAsync(data)} isPending={publish.isPending} progress={publish.progress} />}
  </div></div>;
}