import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Loader2, ListMusic, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MB_HEADERS = { 'User-Agent': 'MusicCritics/1.0 (musiccritics@app.com)' };

// ── MusicBrainz helpers ──────────────────────────────────────────────────────

async function mbSearch(query, limit = 10) {
  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`,
      { headers: MB_HEADERS }
    );
    const data = await res.json();
    return data.releases || [];
  } catch { return []; }
}

async function mbGetTracks(releaseId) {
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings&fmt=json`,
    { headers: MB_HEADERS }
  );
  const data = await res.json();
  const tracks = [];
  (data.media || []).forEach(m => (m.tracks || []).forEach(t => tracks.push(t.title)));
  return tracks;
}

async function mbGetCover(releaseId, releaseGroupId) {
  for (const url of [
    `https://coverartarchive.org/release/${releaseId}`,
    releaseGroupId && `https://coverartarchive.org/release-group/${releaseGroupId}`,
  ].filter(Boolean)) {
    try {
      const res = await fetch(url, { headers: MB_HEADERS });
      if (res.ok) {
        const data = await res.json();
        const front = data.images?.find(i => i.front) || data.images?.[0];
        if (front) return front.thumbnails?.['500'] || front.thumbnails?.large || front.image;
      }
    } catch {}
  }
  return null;
}

async function fetchFromMusicBrainz(title, artist, year) {
  // 4 search strategies: exact → loose → alias (romanized names) → title only
  const queries = [
    `release:"${title}" AND artist:"${artist}"`,
    `release:${title} AND artist:${artist}`,
    `release:"${title}" AND alias:"${artist}"`,  // catches romanized Japanese/Korean artist names
    `release:"${title}"`,
  ];

  let best = null;
  for (const q of queries) {
    const releases = await mbSearch(q);
    if (!releases.length) continue;
    best = releases[0];
    if (year) {
      const withYear = releases.find(r => r.date?.startsWith(String(year)));
      if (withYear) { best = withYear; break; }
    }
    break;
  }
  if (!best) return null;

  const [tracks, coverUrl] = await Promise.all([
    mbGetTracks(best.id),
    mbGetCover(best.id, best['release-group']?.id),
  ]);
  return tracks.length ? { tracks, coverUrl, source: 'MusicBrainz' } : null;
}

// ── iTunes Search API (Apple) ────────────────────────────────────────────────
// Excellent coverage of Japanese, Korean, and Asian music markets

async function fetchFromItunes(title, artist) {
  try {
    // Search for the album
    const q = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&entity=album&limit=5`
    );
    const data = await res.json();
    const results = data.results || [];
    if (!results.length) return null;

    // Find best match
    const album = results.find(r =>
      r.collectionName?.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(r.collectionName?.toLowerCase())
    ) || results[0];

    // Fetch tracks for this album
    const trackRes = await fetch(
      `https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song`
    );
    const trackData = await trackRes.json();
    const tracks = (trackData.results || [])
      .filter(r => r.wrapperType === 'track')
      .sort((a, b) => a.trackNumber - b.trackNumber)
      .map(r => r.trackName);

    // Cover: iTunes gives 100x100, upgrade to 600x600
    const coverUrl = album.artworkUrl100?.replace('100x100', '600x600') || null;

    return tracks.length ? { tracks, coverUrl, source: 'iTunes' } : null;
  } catch { return null; }
}

// ── Last.fm API ──────────────────────────────────────────────────────────────
// Strong global database, good for obscure / non-Western artists

async function fetchFromLastfm(title, artist) {
  try {
    // Last.fm has a public API that works without key for getInfo
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=c9d2b37e0f9ecd8ef5c3b4f09a122d54&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(title)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const album = data.album;
    if (!album) return null;

    const tracks = (album.tracks?.track || []).map(t =>
      typeof t === 'string' ? t : t.name
    );
    const coverUrl = album.image?.find(i => i.size === 'extralarge')?.['#text'] ||
                     album.image?.find(i => i.size === 'large')?.['#text'] || null;

    return tracks.length ? { tracks, coverUrl: coverUrl || null, source: 'Last.fm' } : null;
  } catch { return null; }
}

// ── Main fetch orchestrator ──────────────────────────────────────────────────

async function fetchTracklist(title, artist, year) {
  // Run MusicBrainz + iTunes in parallel first (fastest)
  const [mbResult, itunesResult] = await Promise.all([
    fetchFromMusicBrainz(title, artist, year),
    fetchFromItunes(title, artist),
  ]);

  // Prefer MusicBrainz (most accurate tracklist), fallback iTunes, then Last.fm
  if (mbResult?.tracks?.length) return mbResult;
  if (itunesResult?.tracks?.length) {
    // If iTunes found tracks but no cover, try to get MB cover still
    if (!itunesResult.coverUrl && mbResult?.coverUrl) itunesResult.coverUrl = mbResult.coverUrl;
    return itunesResult;
  }

  // Last resort: Last.fm
  return await fetchFromLastfm(title, artist);
}

export default function TrackList({ item, v, onDataFetched }) {
  const [tracks, setTracks] = useState(item.tracklist || []);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(item.tracklist?.length > 0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (item.type === 'single' || fetched) return;
    setLoading(true);
    fetchTracklist(item.title, item.artist, item.release_year).then(result => {
      setLoading(false);
      if (result?.tracks?.length) {
        setTracks(result.tracks);
        setFetched(true);
        // Save back to DB
        const update = { tracklist: result.tracks };
        if (!item.cover_url && result.coverUrl) update.cover_url = result.coverUrl;
        if (result.mbid) update.musicbrainz_id = result.mbid;
        base44.entities.Album.update(item.id, update);
        onDataFetched?.(update);
      }
    });
  }, [item.id]);

  if (item.type === 'single') return null;

  return (
    <div className="px-5 pb-4">
      <button
        onClick={() => tracks.length > 0 && setExpanded(e => !e)}
        className="flex items-center gap-2 mb-3 w-full text-left"
        style={{ cursor: tracks.length > 0 ? 'pointer' : 'default' }}
      >
        <ListMusic className="w-3.5 h-3.5" style={{ color: v.accent }} />
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>Tracklist</p>
        {tracks.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${v.accent}15`, color: v.accent }}>
            {tracks.length} tracks
          </span>
        )}
        {tracks.length > 0 && (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
            <ChevronDown className="w-4 h-4" style={{ color: v.muted }} />
          </motion.div>
        )}
      </button>

      {loading ? (
        <div className="flex items-center gap-2 py-3" style={{ color: v.muted }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Fetching tracklist…</span>
        </div>
      ) : tracks.length > 0 ? (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {tracks.map((track, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: `${v.accent}07` }}
                  >
                    <span className="text-xs w-5 text-right shrink-0 font-mono" style={{ color: `${v.muted}80` }}>{i + 1}</span>
                    <Music className="w-3 h-3 shrink-0" style={{ color: `${v.accent}60` }} />
                    <span className="text-sm" style={{ color: v.text }}>{track}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <p className="text-xs py-2" style={{ color: `${v.muted}80` }}>Tracklist not found across MusicBrainz, iTunes & Last.fm.</p>
      )}
    </div>
  );
}