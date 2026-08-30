import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Preference labels chosen at profile setup → Album.genre enum ids.
const PREF_TO_GENRE = {
  'Rock': 'rock', 'Pop': 'pop', 'Classical': 'classical', 'Metal': 'metal',
  'Jazz': 'jazz', 'Blues': 'blues', 'R&B': 'r_and_b', 'Core': 'punk',
  'Country': 'country', 'Hip-hop': 'hip_hop', 'Indie': 'indie', 'Grunge': 'grunge',
  'Electronic': 'electronic', 'Funk': 'funk', 'ACG': 'acg', 'Cinematic': 'cinematic',
};

// Home feed: newest reviews + podcasts for everyone, plus an AI-curated
// "For You" selection for logged-in members based on their music_preferences.
// Uses the service role so the feed works for guests (public content) too.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch (e) { user = null; }

    const reviews = await base44.asServiceRole.entities.Review.list('-created_date', 40);
    const approved = (reviews || []).filter(r => !r.moderation_status || r.moderation_status === 'approved');

    const podcasts = await base44.asServiceRole.entities.Podcast.list('-created_date', 10);

    // Join review → album genre so we can match against preferences.
    const albums = await base44.asServiceRole.entities.Album.list('-created_date', 100);
    const genreById = {};
    (albums || []).forEach(a => { if (a && a.id) genreById[a.id] = a.genre; });
    const enriched = approved.map(r => ({ ...r, _genre: genreById[r.album_id] || null }));

    const recentReviews = enriched.slice(0, 6);

    // "For You" — genre-matched, then AI-curated with a personal reason each.
    const prefs = (user?.music_preferences || []).map(p => PREF_TO_GENRE[p]).filter(Boolean);
    let forYou = [];
    let aiBlurb = '';
    if (prefs.length > 0) {
      const matched = enriched.filter(r => r._genre && prefs.includes(r._genre));
      forYou = matched.slice(0, 8);
      if (forYou.length > 0) {
        const candidates = forYou.map(r => ({
          id: r.id, title: r.album_title, artist: r.album_artist, genre: r._genre,
          rating: r.rating, snippet: (r.content || '').slice(0, 140),
        }));
        const prefLabels = (user.music_preferences || []).join(', ');
        let res = { blurb: '', picks: [] };
        try {
          res = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt:
              `A music-loving high schooler just opened their homepage. Their favourite genres: ${prefLabels}. ` +
              `From these recent reviews, pick the ${Math.min(4, candidates.length)} most relevant for them and write a warm, ` +
              `specific one-line reason for each (address them as "you", tie it to their taste). ` +
              `Also write a one-sentence intro greeting them and naming their taste.\nReviews:\n${JSON.stringify(candidates)}`,
            response_json_schema: {
              type: 'object',
              properties: {
                blurb: { type: 'string' },
                picks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { id: { type: 'string' }, reason: { type: 'string' } },
                    required: ['id', 'reason'],
                  },
                },
              },
              required: ['blurb', 'picks'],
            },
          });
        } catch (e) { res = { blurb: '', picks: [] }; }
        aiBlurb = res.blurb || '';
        const reasonMap = {};
        (res.picks || []).forEach(p => { if (p && p.id) reasonMap[p.id] = p.reason; });
        forYou = forYou.filter(r => reasonMap[r.id]).map(r => ({ ...r, _reason: reasonMap[r.id] }));
      }
    }

    const strip = (r) => ({
      id: r.id, album_id: r.album_id, album_title: r.album_title, album_artist: r.album_artist,
      album_cover_url: r.album_cover_url, rating: r.rating, title: r.title, content: r.content,
      reviewer_name: r.reviewer_name, created_date: r.created_date,
      _genre: r._genre, _reason: r._reason || null,
    });

    return Response.json({
      recentReviews: recentReviews.map(strip),
      recentPodcasts: (podcasts || []).slice(0, 4),
      forYou: forYou.map(strip),
      aiBlurb,
      hasPreferences: prefs.length > 0,
      isLoggedIn: !!user,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}