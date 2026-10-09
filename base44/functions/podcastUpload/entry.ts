import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { r2Configuration } from '../../shared/r2Configuration.ts';
import { ownedPodcastUpload } from '../../shared/podcastUploadState.ts';
import { startPodcastUpload, podcastUploadPart, completePodcastUpload, abortPodcastUpload, proxyPodcastPart } from '../../shared/r2Multipart.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await base44.auth.isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const multipart = req.headers.get('content-type')?.includes('multipart/form-data');
    const data = multipart ? Object.fromEntries(await req.formData()) : await req.json();
    if (data.action === 'configuration') return Response.json(await r2Configuration(data.origin));
    if (data.action === 'start') return Response.json(await startPodcastUpload(base44, user, data));
    if (!['part', 'proxy', 'complete', 'abort'].includes(data.action)) return Response.json({ error: 'INVALID_ACTION' }, { status: 400 });
    const session = await ownedPodcastUpload(base44, user, data.session_id);
    if (data.action === 'part') return Response.json(await podcastUploadPart(session, data.part_number));
    if (data.action === 'proxy') return Response.json(await proxyPodcastPart(session, Number(data.part_number), data.file));
    if (data.action === 'complete') return Response.json(await completePodcastUpload(base44, session));
    return Response.json(await abortPodcastUpload(base44, session));
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}