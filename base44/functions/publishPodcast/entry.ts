import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { validatePodcastCover } from '../../shared/podcastCover.ts';
import { resolvePodcastAudio } from '../../shared/resolvePodcastAudio.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await base44.auth.isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const multipart = req.headers.get('content-type')?.includes('multipart/form-data');
    const form = multipart ? await req.formData() : new Map(Object.entries(await req.json()));
    const title = String(form.get('title') || '').trim(), hostName = String(form.get('host_name') || '').trim();
    const category = String(form.get('category') || ''), description = String(form.get('description') || '').trim();
    const categories = ['youth_ears_lab', 'sonic_technical_breakdown', 'cross_cultural_sound', 'live_scene_chronicle', 'independent_creator', 'behind_the_lyrics'];
    // New artwork is a file, not a caller-chosen external URL.
    if (form.get('cover_url')) return Response.json({ error: 'COVER_FILE_REQUIRED' }, { status: 400 });
    const coverFile = form.get('cover_file');
    const cover = coverFile ? await validatePodcastCover(coverFile) : null;
    if (coverFile && !cover) return Response.json({ error: 'INVALID_COVER' }, { status: 400 });
    if (!title || title.length > 200 || !hostName || hostName.length > 120 || description.length > 5000 || !categories.includes(category)) return Response.json({ error: 'INVALID_METADATA' }, { status: 400 });

    const audio = await resolvePodcastAudio(base44, user, form);
    if (audio.existingEpisode) return Response.json({ episode: audio.existingEpisode });
    const coverUpload = cover ? await base44.integrations.Core.UploadPrivateFile({ file: cover }) : null;
    const asset = await base44.entities.PodcastAudioAsset.create({ ...audio.assetData, ...(coverUpload ? { cover_file_uri: coverUpload.file_uri, cover_file_name: cover.name } : {}) });
    const minutes = Number(form.get('duration_minutes'));
    let episode;
    try {
      episode = await base44.entities.Podcast.create({ title, host_name: hostName, host_email: user.email, category, description, has_uploaded_cover: !!cover, audio_asset_id: asset.id, duration_minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 0 });
      if (audio.session) await base44.entities.PodcastUploadSession.update(audio.session.id, { status: 'published', podcast_id: episode.id });
      return Response.json({ episode });
    } catch (error) {
      if (episode) await base44.entities.Podcast.delete(episode.id);
      await base44.entities.PodcastAudioAsset.delete(asset.id);
      throw error;
    }
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}