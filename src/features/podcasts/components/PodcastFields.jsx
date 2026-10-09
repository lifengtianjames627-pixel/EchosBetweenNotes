import React from 'react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import { useLang } from '@/i18n/LanguageContext';
/** @param {{ data: import('@/features/podcasts/model/podcastTypes').PodcastFields, setData: React.Dispatch<React.SetStateAction<import('@/features/podcasts/model/podcastTypes').PodcastFields>>, copy: ReturnType<typeof import('@/features/podcasts/i18n/podcastCopy').default>, busy: boolean }} props */
export default function PodcastFields({ data, setData, copy, busy }) {
  const { t } = useLang();
  const inputClass = 'mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50';
  return <fieldset disabled={busy} className="space-y-3">
    <label className="block text-xs font-semibold">{copy.title}<input name="title" required maxLength={200} className={inputClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
    <label className="block text-xs font-semibold">{copy.host}<input name="host_name" required maxLength={120} className={inputClass} value={data.host_name} onChange={e => setData({ ...data, host_name: e.target.value })} /></label>
    <label className="block text-xs font-semibold">{copy.category}<select name="category" className={inputClass} value={data.category} onChange={e => setData({ ...data, category: e.target.value })}>{PODCAST_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(`pod.cat.${c.id}.label`)}</option>)}</select></label>
    <label className="block text-xs font-semibold">{copy.description}<textarea name="description" rows={3} maxLength={5000} className={inputClass} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>

  </fieldset>;
}