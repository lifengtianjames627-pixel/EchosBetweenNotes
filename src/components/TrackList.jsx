import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Loader2, ListMusic } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MB_HEADERS = { 'User-Agent': 'MusicCritics/1.0 (musiccritics@app.com)' };

async function searchReleases(query, limit = 10) {
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`,
    { headers: MB_HEADERS }
  );
  const data = await res.json();
  return data.releases || [];
}

async function getCoverUrl(releaseId, releaseGroupId) {
  // Try release cover first
  try {
    const res = await fetch(`https://coverartarchive.org/release/${releaseId}`, { headers: MB_HEADERS });
    if (res.ok) {
      const data = await res.json();
      const front = data.images?.find(i => i.front) || data.images?.[0];
      if (front) return front.thumbnails?.['500'] || front.thumbnails?.large || front.image;
    }
  } catch {}
  // Fallback: release-group cover (catches albums where only the group has art)
  if (releaseGroupId) {
    try {
      const res = await fetch(`https://coverartarchive.org/release-group/${releaseGroupId}`, { headers: MB_HEADERS });
      if (res.ok) {
        const data = await res.json();
        const front = data.images?.find(i => i.front) || data.images?.[0];
        if (front) return front.thumbnails?.['500'] || front.thumbnails?.large || front.image;
      }
    } catch {}
  }
  return null;
}

async function fetchTracklist(title, artist, year) {
  try {
    // Strategy 1: exact phrase match
    let releases = await searchReleases(`release:"${title}" AND artist:"${artist}"`);

    // Strategy 2: unquoted broader search
    if (!releases.length) {
      releases = await searchReleases(`release:${title} AND artist:${artist}`);
    }

    // Strategy 3: title only (helps with non-latin / obscure artists)
    if (!releases.length) {
      releases = await searchReleases(`release:${title}`);
    }

    if (!releases.length) return null;

    // Pick best match — prefer year match, then highest score
    let best = releases[0];
    if (year) {
      const withYear = releases.find(r => r.date && r.date.startsWith(String(year)));
      if (withYear) best = withYear;
    }

    // Fetch full release with recordings
    const releaseRes = await fetch(
      `https://musicbrainz.org/ws/2/release/${best.id}?inc=recordings&fmt=json`,
      { headers: MB_HEADERS }
    );
    const releaseData = await releaseRes.json();
    const media = releaseData.media || [];
    const tracks = [];
    media.forEach(m => (m.tracks || []).forEach(t => tracks.push(t.title)));

    const coverUrl = await getCoverUrl(best.id, best['release-group']?.id);

    return { tracks, coverUrl, mbid: best.id };
  } catch {
    return null;
  }
}

export default function TrackList({ item, v, onDataFetched }) {
  const [tracks, setTracks] = useState(item.tracklist || []);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(item.tracklist?.length > 0);

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
      <div className="flex items-center gap-2 mb-3">
        <ListMusic className="w-3.5 h-3.5" style={{ color: v.accent }} />
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>Tracklist</p>
        {tracks.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${v.accent}15`, color: v.accent }}>
            {tracks.length} tracks
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3" style={{ color: v.muted }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Fetching tracklist from MusicBrainz…</span>
        </div>
      ) : tracks.length > 0 ? (
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
      ) : (
        <p className="text-xs py-2" style={{ color: `${v.muted}80` }}>Tracklist not found in MusicBrainz.</p>
      )}
    </div>
  );
}