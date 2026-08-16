import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Builds the Messages landing lists for the signed-in user:
//  - conversations: one row per person they've already talked to, newest first
//  - nearby: people active on the band board, ordered by real distance when both
//    sides have shared their device location, otherwise by same city
// Service role is needed to scan chat ids / posts, but only the caller's own
// conversations and age-bracket-safe people are ever returned. Coordinates are
// never sent back — only a rounded distance in km.

function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const [messages, posts, users] = await Promise.all([
      svc.entities.ChatMessage.list('-created_date', 500),
      svc.entities.RecruitPost.filter({ status: 'active' }, '-created_date', 200),
      svc.entities.User.list(),
    ]);

    const myMessages = messages.filter(m => (m.chat_id || '').split('|').includes(user.email));
    const conversations = [];
    const byPeer = new Map();
    for (const m of myMessages) {
      const parts = (m.chat_id || '').split('|');
      const peer = parts.find(e => e !== user.email) || user.email;
      if (!byPeer.has(peer)) {
        const row = {
          peer_email: peer,
          peer_name: peer,
          last_message: m.content || '',
          last_at: m.created_date,
          from_me: m.sender_email === user.email,
        };
        byPeer.set(peer, row);
        conversations.push(row);
      }
      const row = byPeer.get(peer);
      if (m.sender_email !== user.email && m.sender_name && row.peer_name === peer) {
        row.peer_name = m.sender_name;
      }
    }

    const myPosts = posts.filter(p => p.author_email === user.email);
    const myCity = myPosts.find(p => p.city)?.city || '';
    const ageGroup = user.age_group || myPosts[0]?.author_age_group || null;

    const coordsByEmail = new Map();
    for (const u of users) {
      if (typeof u.location_lat === 'number' && typeof u.location_lng === 'number') {
        coordsByEmail.set(u.email, { lat: u.location_lat, lng: u.location_lng });
      }
    }
    const mine = coordsByEmail.get(user.email) || null;

    const candidates = posts.filter(p =>
      p.author_email && p.author_email !== user.email &&
      p.moderation_status !== 'blocked' &&
      (!ageGroup || !p.author_age_group || p.author_age_group === ageGroup)
    );
    const sameCity = myCity
      ? candidates.filter(p => (p.city || '').toLowerCase() === myCity.toLowerCase())
      : [];
    // With real coordinates every candidate is ranked by distance; without them we
    // fall back to the same-city grouping.
    const pool = mine ? candidates : (sameCity.length ? sameCity : candidates);

    const seen = new Set();
    let nearby = [];
    for (const p of pool) {
      if (seen.has(p.author_email)) continue;
      seen.add(p.author_email);
      const theirs = coordsByEmail.get(p.author_email);
      const km = mine && theirs ? distanceKm(mine.lat, mine.lng, theirs.lat, theirs.lng) : null;
      nearby.push({
        email: p.author_email,
        name: p.author_name || p.author_email,
        city: p.city || '',
        school: p.school || '',
        kind: p.kind,
        title: p.title || '',
        distance_km: km === null ? null : Math.round(km * 10) / 10,
      });
    }

    if (mine) {
      nearby.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }
    nearby = nearby.slice(0, 12);

    return Response.json({
      conversations: conversations.slice(0, 25),
      nearby,
      my_city: myCity,
      matched_city: sameCity.length > 0,
      located: !!mine,
      located_count: nearby.filter(n => n.distance_km !== null).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});