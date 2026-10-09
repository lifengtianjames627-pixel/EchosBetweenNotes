import React, { useRef } from 'react';
/** @param {{ cover: ReturnType<typeof import('@/features/podcasts/queries/useLocalCover').default>, copy: ReturnType<typeof import('@/features/podcasts/i18n/podcastCopy').default>, busy: boolean }} props */
export default function PodcastCoverInput({ cover, copy, busy }) {
  const input = useRef(/** @type {HTMLInputElement | null} */ (null));
  return <div className="space-y-2 border border-dashed bg-background p-3">
    <label className="block text-xs font-semibold">{copy.cover}<input ref={input} name="cover_file" type="file" accept=".png,.jpg,.jpeg,.webp" disabled={busy} onChange={e => cover.select(e.target.files?.[0])} className="mt-2 block w-full min-w-0 text-xs file:mr-3 file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground" /></label>
    <p className="text-xs text-muted-foreground">{copy.coverHint}</p>
    {cover.url && <img key={cover.url} data-testid="podcast-cover-preview" src={cover.url} alt={copy.cover} onLoad={cover.loaded} onError={cover.failed} className="max-h-40 max-w-full border object-contain" />}
    {(cover.file || cover.error) && <button type="button" disabled={busy} onClick={() => { cover.clear(); if (input.current) input.current.value = ''; }} className="text-xs text-accent underline disabled:opacity-50">{copy.coverRemove}</button>}
    {cover.error && <p role="alert" className="text-xs text-destructive">{cover.error}</p>}
  </div>;
}