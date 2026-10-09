import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await base44.auth.isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await base44.auth.me();
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { podcast_id } = await req.json();
    if (typeof podcast_id !== 'string' || !podcast_id.trim() || podcast_id.length > 100) return Response.json({ error: 'INVALID_PODCAST' }, { status: 400 });
    const page = await base44.entities.Podcast.filter({ id: podcast_id }, { limit: 1 });
    const episode = page.items[0];
    if (!episode?.audio_asset_id) return Response.json({ error: 'Not found' }, { status: 404 });
    // Only the asset referenced by a readable episode is accessible. Never accept file URIs from callers.
    const assets = await base44.asServiceRole.entities.PodcastAudioAsset.filter({ id: episode.audio_asset_id }, { limit: 1 });
    const asset = assets.items[0];
    if (!asset) return Response.json({ error: 'Not found' }, { status: 404 });
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: asset.file_uri, expires_in: 3600 });
    return Response.json({ signed_url, expires_in: 3600 });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}