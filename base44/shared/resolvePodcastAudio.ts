import { audioMetadata, validAudioHeader } from './podcastAudio.ts';
import { ownedPodcastUpload, verifyR2Audio } from './podcastUploadState.ts';
export async function resolvePodcastAudio(base44, user, form) {
  if (form.get('upload_session_id')) {
    const session = await ownedPodcastUpload(base44, user, form.get('upload_session_id'));
    if (session.status === 'published' && session.podcast_id) return { existingEpisode: await base44.entities.Podcast.get(session.podcast_id) };
    if (session.status !== 'completed') throw Object.assign(new Error('UPLOAD_NOT_COMPLETE'), { status: 400 });
    await verifyR2Audio(session);
    return { session, assetData: { owner_id: user.id, file_uri: 'r2://' + session.object_key, file_name: session.file_name, size_bytes: session.size_bytes, content_type: session.content_type, storage_provider: 'r2', r2_object_key: session.object_key } };
  }
  // Preserve existing platform-hosted uploads without raising their real transport limit.
  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function' || file.size > 50 * 1024 * 1024) throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 });
  const metadata = audioMetadata(file.name, file.size), bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!validAudioHeader(metadata.extension, bytes)) throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 });
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: new File([file], file.name, { type: metadata.content_type }) });
  return { assetData: { owner_id: user.id, file_uri, file_name: file.name, size_bytes: file.size, content_type: metadata.content_type, storage_provider: 'base44' } };
}