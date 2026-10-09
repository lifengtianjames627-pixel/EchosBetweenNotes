import React from 'react';
export default function PodcastAudioInput({ audio, copy, busy }) {
  return <div className="space-y-2 border border-dashed bg-background p-3">
    <label className="block text-xs font-semibold">{copy.audio}<input name="audio_file" type="file" required accept=".wav,.mp3,.m4a,.aac,.ogg,.opus,.flac,.webm" disabled={busy} onChange={e => audio.select(e.target.files?.[0])} className="mt-2 block w-full min-w-0 text-xs file:mr-3 file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground" /></label>
    <p className="text-xs text-muted-foreground">{copy.formats}</p>
    {audio.url && <div><p className="mb-2 text-xs text-muted-foreground">{copy.preview}</p><audio key={audio.url} data-testid="podcast-preview" controls preload="metadata" src={audio.url} onLoadedMetadata={e => audio.loaded(e.currentTarget)} onError={audio.failed} className="w-full min-w-0" /></div>}
    {audio.error && <p role="alert" className="text-xs text-destructive">{audio.error}</p>}
  </div>;
}