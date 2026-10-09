import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/i18n/LanguageContext';
import { publicName } from '@/shared/identity';
import { openPrivateChat } from '@/shared/chat/openPrivateChat';
import { SERIES_COVERS } from '@/features/podcasts/model/seriesCovers';
import PodcastPlayer from '@/features/podcasts/components/PodcastPlayer';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
/** @param {{ episode: import('@/features/podcasts/model/podcastTypes').PodcastEpisode }} props */
export default function PodcastEpisodeCard({ episode }) {
  const { user } = useAuth(), { lang } = useLang();
  const copy = podcastCopy(lang), name = publicName(episode.host_name);
  return <article data-testid="podcast-episode" className="flex flex-col gap-4 border border-border bg-card p-5 text-card-foreground sm:flex-row">
    <img src={episode.cover_url || SERIES_COVERS[episode.category]} alt="" className="aspect-[3/2] w-full object-cover sm:aspect-square sm:h-24 sm:w-24" />
    <div className="min-w-0 flex-1">
      <h2 className="font-playfair text-xl italic leading-snug break-words">{episode.title}</h2>
      {episode.host_email && episode.host_email !== user?.email ? <button onClick={() => openPrivateChat(episode.host_email, name)} className="mt-1 text-xs text-accent underline">{name}</button> : <p className="mt-1 text-xs text-accent">{name}</p>}
      {episode.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{episode.description}</p>}
      {episode.duration_minutes > 0 && <p className="mt-2 text-xs text-muted-foreground">{Number(episode.duration_minutes.toFixed(1)).toLocaleString(lang)} {copy.minutes}</p>}
      <PodcastPlayer episode={episode} />
    </div>
  </article>;
}