import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import { useLang } from '@/i18n/LanguageContext';
import podcastCopy from '@/features/podcasts/i18n/podcastCopy';
import useLocalAudio from '@/features/podcasts/queries/useLocalAudio';
import PodcastFields from '@/features/podcasts/components/PodcastFields';
import PodcastAudioInput from '@/features/podcasts/components/PodcastAudioInput';
/** @param {{ defaultCategory: string, onClose: () => void, onSubmit: (data: import('@/features/podcasts/model/podcastTypes').PodcastFields & { file: File, duration_minutes: number }) => Promise<unknown>, isPending: boolean }} props */
export default function AddPodcastModal({ defaultCategory, onClose, onSubmit, isPending }) {
  const { lang } = useLang(), copy = podcastCopy(lang), audio = useLocalAudio(copy);
  const [data, setData] = useState({ title: '', host_name: '', category: defaultCategory || PODCAST_CATEGORIES[0].id, description: '', cover_url: '' });
  const [error, setError] = useState('');
  const opener = useRef(/** @type {HTMLElement | null} */ (document.activeElement));
  const submit = async event => {
    event.preventDefault(); if (!audio.ready || !audio.file || isPending) return;
    setError('');
    try { await onSubmit({ ...data, file: audio.file, duration_minutes: audio.minutes }); }
    catch { setError(copy.failed); }
  };
  return <Dialog.Root open onOpenChange={open => { if (!open && !isPending) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[300] bg-foreground/40" />
    <Dialog.Content className="pointer-events-auto fixed left-1/2 top-1/2 z-[310] max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border bg-card p-5 text-card-foreground shadow-xl sm:p-7" onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}>
      <Dialog.Title className="pr-8 font-playfair text-2xl italic">{copy.upload}</Dialog.Title>
      <Dialog.Description className="mb-5 mt-3 text-xs leading-relaxed text-muted-foreground">{copy.privacy}</Dialog.Description>
      <Dialog.Close disabled={isPending} aria-label={copy.close} className="absolute right-4 top-4 p-1 text-muted-foreground disabled:opacity-50"><X className="h-5 w-5" /></Dialog.Close>
      <form onSubmit={submit} className="space-y-4">
        <PodcastFields data={data} setData={setData} copy={copy} busy={isPending} />
        <PodcastAudioInput audio={audio} copy={copy} busy={isPending} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {isPending && <p role="status" className="text-xs text-muted-foreground">{copy.saving}</p>}
        <div className="flex flex-wrap gap-3 border-t pt-4"><button type="submit" disabled={isPending || !audio.ready || !data.title.trim() || !data.host_name.trim()} className="flex-1 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">{isPending ? copy.saving : copy.save}</button><button type="button" disabled={isPending} onClick={onClose} className="border px-4 py-3 text-sm disabled:opacity-40">{copy.cancel}</button></div>
      </form>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}