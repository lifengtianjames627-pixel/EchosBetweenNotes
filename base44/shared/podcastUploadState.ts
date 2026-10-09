import { requestR2 } from './r2Storage.ts';
import { audioMetadata, validAudioHeader } from './podcastAudio.ts';
export async function ownedPodcastUpload(base44, user, id) {
  if (typeof id !== 'string' || !id || id.length > 100) throw Object.assign(new Error('INVALID_UPLOAD'), { status: 400 });
  const page = await base44.entities.PodcastUploadSession.filter({ id, owner_id: user.id }, { limit: 1 });
  const session = page.items[0];
  if (!session) throw Object.assign(new Error('UPLOAD_NOT_FOUND'), { status: 404 });
  if (!/^podcasts\/[a-f0-9-]{36}\.(wav|mp3|m4a|aac|ogg|opus|flac|webm)$/.test(session.object_key)) throw Object.assign(new Error('INVALID_UPLOAD'), { status: 400 });
  audioMetadata(session.file_name, session.size_bytes);
  return session;
}
export async function verifyR2Audio(session) {
  const head = await requestR2('HEAD', session.object_key);
  if (Number(head.headers.get('content-length')) !== session.size_bytes || head.headers.get('content-type') !== session.content_type) throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 });
  const response = await requestR2('GET', session.object_key, {}, '', { range: 'bytes=0-15' });
  if (response.status !== 206 || Number(response.headers.get('content-length')) !== 16) { await response.body?.cancel(); throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 }); }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const { extension } = audioMetadata(session.file_name, session.size_bytes);
  if (!validAudioHeader(extension, bytes)) throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 });
}