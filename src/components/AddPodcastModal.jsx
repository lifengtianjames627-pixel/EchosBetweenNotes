import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import { useLang } from '@/i18n/LanguageContext';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
import useLocalAudio from '@/features/podcasts/queries/useLocalAudio';
import PodcastFields from '@/features/podcasts/components/PodcastFields';
import PodcastAudioInput from '@/features/podcasts/components/PodcastAudioInput';
import PodcastCoverInput from '@/features/podcasts/components/PodcastCoverInput';
import useLocalCover from '@/features/podcasts/queries/useLocalCover';
import useR2UploadConfiguration from '@/features/podcasts/queries/useR2UploadConfiguration';
import R2UploadSetup from '@/features/podcasts/components/R2UploadSetup';
/** @param {{ defaultCategory: string, onClose: () => void, onSubmit: (data: import('@/features/podcasts/model/podcastTypes').PodcastFields & { file: File, duration_minutes: number }) => Promise<unknown>, isPending: boolean, progress?: number }} props */
export default function AddPodcastModal({ defaultCategory, onClose, onSubmit, isPending, progress = 0 }) {
  const { lang } = useLang(), copy = podcastCopy(lang), audio = useLocalAudio(copy), cover = useLocalCover(copy);
  const [data, setData] = useState({ title: '', host_name: '', category: defaultCategory || PODCAST_CATEGORIES[0].id, description: '' });
  const [error, setError] = useState('');
  const setup = useR2UploadConfiguration();
  const opener = useRef(/** @type {HTMLElement | null} */ (document.activeElement));
  const submit = async event => {
    event.preventDefault(); if (!audio.ready || !audio.file || !cover.ready || !setup.data?.connection_ok || isPending) return;
    setError('');
    try { await onSubmit({ ...data, file: audio.file, duration_minutes: audio.minutes, ...(cover.file ? { cover_file: cover.file } : {}) }); }
    catch { setError(copy.failed); }
  };
  return <Dialog.Root open onOpenChange={open => { if (!open && !isPending) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[300] bg-foreground/40" />
    <Dialog.Content className="pointer-events-auto fixed left-1/2 top-1/2 z-[310] max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border bg-card p-5 text-card-foreground shadow-xl sm:p-7" onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}>
      <Dialog.Title className="pr-8 font-playfair text-2xl italic">{copy.upload}</Dialog.Title>
      <Dialog.Description className="mb-5 mt-3 text-xs leading-relaxed text-muted-foreground">{copy.privacy}</Dialog.Description>
      <Dialog.Close disabled={isPending} aria-label={copy.close} className="absolute right-4 top-4 p-1 text-muted-foreground disabled:opacity-50"><X className="h-5 w-5" /></Dialog.Close>
      <form onSubmit={submit} className="space-y-4">
        <R2UploadSetup setup={setup} copy={copy} />
        <PodcastFields data={data} setData={setData} copy={copy} busy={isPending} />
        <PodcastCoverInput cover={cover} copy={copy} busy={isPending} />
        <PodcastAudioInput audio={audio} copy={copy} busy={isPending} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {isPending && <p role="status" className="text-xs text-muted-foreground">{copy.saving} {progress}%</p>}
        <div className="flex flex-wrap gap-3 border-t pt-4"><button type="submit" disabled={isPending || !setup.data?.connection_ok || !audio.ready || !cover.ready || !data.title.trim() || !data.host_name.trim()} className="flex-1 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">{isPending ? copy.saving : copy.save}</button><button type="button" disabled={isPending} onClick={onClose} className="border px-4 py-3 text-sm disabled:opacity-40">{copy.cancel}</button></div>
      </form>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}