import { requestR2, signedR2Url, xmlValue, escapeXml } from './r2Storage.ts';
import { audioMetadata, PART_BYTES } from './podcastAudio.ts';
import { verifyR2Audio } from './podcastUploadState.ts';
export async function startPodcastUpload(base44, user, data) {
  const metadata = audioMetadata(data.file_name, data.size_bytes), key = 'podcasts/' + crypto.randomUUID() + '.' + metadata.extension;
  const response = await requestR2('POST', key, { uploads: '' }, '', { 'content-type': metadata.content_type });
  const uploadId = xmlValue(await response.text(), 'UploadId');
  if (!uploadId) throw new Error('R2_INVALID_UPLOAD_RESPONSE');
  try {
    const session = await base44.entities.PodcastUploadSession.create({ owner_id: user.id, object_key: key, upload_id: uploadId, file_name: data.file_name, size_bytes: data.size_bytes, content_type: metadata.content_type, status: 'uploading', expires_at: new Date(Date.now() + 86400000).toISOString() });
    return { session_id: session.id, part_size: PART_BYTES, part_count: Math.ceil(session.size_bytes / PART_BYTES), content_type: session.content_type };
  } catch (error) { const cleanup = await requestR2('DELETE', key, { uploadId }); await cleanup.body?.cancel(); throw error; }
}
function assertUploadPart(session, partNumber) {
  if (session.status !== 'uploading' || Date.parse(session.expires_at) < Date.now() || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > Math.ceil(session.size_bytes / PART_BYTES)) throw Object.assign(new Error('INVALID_UPLOAD_PART'), { status: 400 });
}
export async function podcastUploadPart(session, partNumber) {
  assertUploadPart(session, partNumber);
  return { url: await signedR2Url('PUT', session.object_key, { partNumber: String(partNumber), uploadId: session.upload_id }, session.content_type) };
}
export async function proxyPodcastPart(session, partNumber, file) {
  assertUploadPart(session, partNumber);
  const expected = Math.min(PART_BYTES, session.size_bytes - (partNumber - 1) * PART_BYTES);
  if (!file || typeof file.arrayBuffer !== 'function' || file.size !== expected) throw Object.assign(new Error('INVALID_UPLOAD_PART_SIZE'), { status: 400 });
  const response = await requestR2('PUT', session.object_key, { partNumber: String(partNumber), uploadId: session.upload_id }, await file.arrayBuffer(), { 'content-type': session.content_type });
  await response.body?.cancel();
  return { uploaded: true };
}
export async function completePodcastUpload(base44, session) {
  if (['completed', 'published'].includes(session.status)) return { completed: true };
  if (session.status !== 'uploading' || Date.parse(session.expires_at) < Date.now()) throw Object.assign(new Error('INVALID_UPLOAD_STATE'), { status: 400 });
  const list = await requestR2('GET', session.object_key, { uploadId: session.upload_id });
  const xml = await list.text();
  const parts = [...xml.matchAll(/<Part>([\s\S]*?)<\/Part>/g)].map(match => ({ number: Number(xmlValue(match[1], 'PartNumber')), size: Number(xmlValue(match[1], 'Size')), etag: xmlValue(match[1], 'ETag') }));
  const expected = Math.ceil(session.size_bytes / PART_BYTES);
  if (xmlValue(xml, 'IsTruncated') === 'true' || parts.length !== expected || parts.some((part, index) => part.number !== index + 1 || part.size !== Math.min(PART_BYTES, session.size_bytes - index * PART_BYTES) || !/^"?[a-f0-9]{32}"?$/i.test(part.etag))) throw Object.assign(new Error('INVALID_UPLOAD_PARTS'), { status: 400 });
  const body = '<CompleteMultipartUpload>' + parts.map(part => '<Part><PartNumber>' + part.number + '</PartNumber><ETag>' + escapeXml(part.etag) + '</ETag></Part>').join('') + '</CompleteMultipartUpload>';
  const completed = await requestR2('POST', session.object_key, { uploadId: session.upload_id }, body, { 'content-type': 'application/xml' });
  const completionXml = await completed.text();
  if (completionXml.includes('<Error>') || !xmlValue(completionXml, 'ETag')) throw new Error('R2_COMPLETE_FAILED');
  try { await verifyR2Audio(session); await base44.entities.PodcastUploadSession.update(session.id, { status: 'completed' }); }
  catch (error) { const deleted = await requestR2('DELETE', session.object_key); await deleted.body?.cancel(); await base44.entities.PodcastUploadSession.update(session.id, { status: 'aborted' }); throw error; }
  return { completed: true };
}
export async function abortPodcastUpload(base44, session) {
  if (session.status === 'published') {
    const [episodes, assets] = await Promise.all([base44.entities.Podcast.filter({ id: session.podcast_id }, { limit: 1 }), base44.entities.PodcastAudioAsset.filter({ r2_object_key: session.object_key }, { limit: 1 })]);
    if (episodes.items.length || assets.items.length) throw Object.assign(new Error('UPLOAD_ALREADY_PUBLISHED'), { status: 409 });
  }
  if (session.status === 'aborted') return { aborted: true };
  const response = await requestR2('DELETE', session.object_key, session.status === 'uploading' ? { uploadId: session.upload_id } : {}, '', {}, [404]);
  await response.body?.cancel();
  await base44.entities.PodcastUploadSession.update(session.id, { status: 'aborted' });
  return { aborted: true };
}