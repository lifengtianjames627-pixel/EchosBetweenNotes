import { base44 } from '@/api/base44Client';

// Downloads an externally-hosted cover image (iTunes/MusicBrainz/NetEase/Last.fm)
// and re-uploads it to our own storage, so future page loads read a fast,
// permanent URL instead of re-hitting a slow third-party host every time.
export async function storeCoverImage(externalUrl) {
  if (!externalUrl) return null;
  try {
    const res = await fetch(externalUrl);
    if (!res.ok) return externalUrl;
    const blob = await res.blob();
    const file = new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url || externalUrl;
  } catch {
    return externalUrl;
  }
}