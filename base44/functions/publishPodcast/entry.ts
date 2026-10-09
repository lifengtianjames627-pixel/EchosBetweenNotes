import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { validatePodcastCover } from '../../shared/podcastCover.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await base44.auth.isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) return Response.json({ error: 'INVALID_AUDIO' }, { status: 400 });
    const form = await req.formData();
    const title = String(form.get('title') || '').trim(), hostName = String(form.get('host_name') || '').trim();
    const category = String(form.get('category') || ''), description = String(form.get('description') || '').trim();
    const categories = ['youth_ears_lab', 'sonic_technical_breakdown', 'cross_cultural_sound', 'live_scene_chronicle', 'independent_creator', 'behind_the_lyrics'];
    // New artwork is a file, not a caller-chosen external URL.
    if (form.get('cover_url')) return Response.json({ error: 'COVER_FILE_REQUIRED' }, { status: 400 });
    const coverFile = form.get('cover_file');
    const cover = coverFile ? await validatePodcastCover(coverFile) : null;
    if (coverFile && !cover) return Response.json({ error: 'INVALID_COVER' }, { status: 400 });
    if (!title || title.length > 200 || !hostName || hostName.length > 120 || description.length > 5000 || !categories.includes(category)) return Response.json({ error: 'INVALID_METADATA' }, { status: 400 });

    const file = form.get('file');
    if (!file || typeof file.arrayBuffer !== 'function' || !file.size || file.size > 50 * 1024 * 1024) return Response.json({ error: 'INVALID_AUDIO' }, { status: 400 });
    const extension = file.name.split('.').pop().toLowerCase();
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const text = new TextDecoder().decode(bytes);
    const frame = bytes[0] === 255 && (bytes[1] & 224) === 224;
    const valid = { wav: text.startsWith('RIFF') && text.slice(8, 12) === 'WAVE', mp3: text.startsWith('ID3') || frame, m4a: text.slice(4, 8) === 'ftyp', aac: frame, ogg: text.startsWith('OggS'), opus: text.startsWith('OggS'), flac: text.startsWith('fLaC'), webm: bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163 };
    if (!valid[extension]) return Response.json({ error: 'INVALID_AUDIO' }, { status: 400 });
    const types = { wav: 'audio/wav', mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac', webm: 'audio/webm' };
    const normalized = new File([file], file.name, { type: types[extension] });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: normalized });
    const coverUpload = cover ? await base44.integrations.Core.UploadPrivateFile({ file: cover }) : null;
    const asset = await base44.entities.PodcastAudioAsset.create({ owner_id: user.id, file_uri, file_name: file.name, content_type: types[extension], size_bytes: file.size, ...(coverUpload ? { cover_file_uri: coverUpload.file_uri, cover_file_name: cover.name } : {}) });
    const minutes = Number(form.get('duration_minutes'));
    try {
      const episode = await base44.entities.Podcast.create({ title, host_name: hostName, host_email: user.email, category, description, has_uploaded_cover: !!cover, audio_asset_id: asset.id, duration_minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 0 });
      return Response.json({ episode });
    } catch (error) {
      await base44.entities.PodcastAudioAsset.delete(asset.id);
      throw error;
    }
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}