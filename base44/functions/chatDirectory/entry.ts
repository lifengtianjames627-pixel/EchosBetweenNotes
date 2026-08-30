import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Builds the Messages landing lists for the signed-in user:
//  - conversations: one row per person they've already talked to, newest first
//  - nearby: EVERY other member who is reachable — same Wi-Fi network (matched
//    by a hashed network address recorded on each visit, no GPS needed), shared
//    map location, or active on the band board. Same-network people always rank
//    first, then real distance. Coordinates are never sent back exactly — only
//    ~1km-coarse pins and rounded km distances.

const NETWORK_WINDOW_MS = 24 * 60 * 60 * 1000; // "on the same Wi-Fi" = seen within 24h
const ONLINE_WINDOW_MS = 5 * 60 * 1000;        // "online" = active in the last 5 minutes

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

// The raw IP is never stored — only a short one-way hash used for equality.
async function networkHash(ip) {
  const data = new TextEncoder().encode('chordmates-net|' + ip);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;

    // Per-peer "last seen" map drives per-conversation unread counts. A legacy
    // single ISO string (old global timestamp) is honoured so existing users
    // don't suddenly see every old message as unread.
    const seenRaw = user.messages_last_seen;
    const seenMap = (typeof seenRaw === 'object' && seenRaw && !Array.isArray(seenRaw)) ? seenRaw : {};
    const legacyGlobal = (typeof seenRaw === 'string' && seenRaw) ? new Date(seenRaw) : null;
    const lastSeenFor = (peer) => seenMap[peer] ? new Date(seenMap[peer]) : (legacyGlobal || new Date(0));
    // Fingerprint the caller's network (same Wi-Fi = same public address) and
    // remember it on their record so friends on the same network find each other.
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || '';
    const myNet = ip ? await networkHash(ip) : null;
    const now = Date.now();
    // Heartbeat: every visit refreshes last_active, which is what makes someone
    // "online" for everyone else (and what their last-known position is dated by).
    await svc.entities.User.update(user.id, {
      last_active: new Date(now).toISOString(),
      ...(myNet ? { network_id: myNet, network_seen: new Date(now).toISOString() } : {}),
    });

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
          unread: 0,
        };
        byPeer.set(peer, row);
        conversations.push(row);
      }
      const row = byPeer.get(peer);
      if (m.sender_email !== user.email) {
        if (m.sender_name && row.peer_name === peer) row.peer_name = m.sender_name;
        if (new Date(m.created_date) > lastSeenFor(peer)) row.unread = (row.unread || 0) + 1;
      }
    }

    const myPosts = posts.filter(p => p.author_email === user.email);
    const myCity = myPosts.find(p => p.city)?.city || '';
    const ageGroup = user.age_group || myPosts[0]?.author_age_group || null;

    // Newest non-blocked post per author, for board info on each person.
    const postByEmail = new Map();
    for (const p of posts) {
      if (p.author_email && p.moderation_status !== 'blocked' && !postByEmail.has(p.author_email)) {
        postByEmail.set(p.author_email, p);
      }
    }

    const mine = (typeof user.location_lat === 'number' && typeof user.location_lng === 'number')
      ? { lat: user.location_lat, lng: user.location_lng }
      : null;

    const onMyNetwork = (u) =>
      !!myNet && u.network_id === myNet && u.network_seen &&
      (now - new Date(u.network_seen).getTime()) < NETWORK_WINDOW_MS;

    let nearby = [];
    for (const u of users) {
      if (!u.email || u.email === user.email) continue;
      const post = postByEmail.get(u.email) || null;
      const theirGroup = u.age_group || post?.author_age_group || null;
      if (ageGroup && theirGroup && theirGroup !== ageGroup) continue;

      const net = onMyNetwork(u);
      const theirs = (typeof u.location_lat === 'number' && typeof u.location_lng === 'number')
        ? { lat: u.location_lat, lng: u.location_lng }
        : null;

      // Reachable = same Wi-Fi, or has a shared location, or is on the board.
      if (!net && !theirs && !post) continue;

      let km = null;
      if (mine && theirs) km = distanceKm(mine.lat, mine.lng, theirs.lat, theirs.lng);
      if (net && km === null) km = 0; // same Wi-Fi ≈ same place

      // Other people's pins are coarsened to ~100 m — precise enough to find the
      // neighbourhood, never an exact address. Same-network people without their
      // own coordinates are placed at the viewer's spot (same Wi-Fi).
      const src = theirs || (net ? mine : null);
      const coarse = src && (mine || net)
        ? { lat: Math.round(src.lat * 1000) / 1000, lng: Math.round(src.lng * 1000) / 1000 }
        : null;

      // Online = heartbeat within the last 5 minutes. When offline we still show
      // the position they had when last seen, marked as such.
      const lastActive = u.last_active || u.network_seen || null;
      const online = !!lastActive && (now - new Date(lastActive).getTime()) < ONLINE_WINDOW_MS;

      nearby.push({
        lat: coarse?.lat ?? null,
        lng: coarse?.lng ?? null,
        online,
        last_active: lastActive,
        location_updated: u.location_updated || null,
        email: u.email,
        picture_url: u.profile_picture_url || '',
        name: u.display_name || u.full_name || post?.author_name || u.email,
        city: post?.city || '',
        school: post?.school || '',
        kind: post?.kind || null,
        title: post?.title || '',
        same_network: net,
        distance_km: km === null ? null : km < 1 ? Math.round(km * 100) / 100 : Math.round(km * 10) / 10,
      });
    }

    nearby.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      if (a.same_network !== b.same_network) return a.same_network ? -1 : 1;
      if (a.distance_km === null) return b.distance_km === null ? 0 : 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });
    nearby = nearby.slice(0, 16);

    const sameCity = myCity
      ? nearby.some(n => (n.city || '').toLowerCase() === myCity.toLowerCase())
      : false;

    return Response.json({
      conversations: conversations.slice(0, 25),
      nearby,
      my_city: myCity,
      matched_city: sameCity,
      located: !!mine,
      network_active: !!myNet,
      // Your own position comes back at full precision — it's your data,
      // and it centres the map exactly where you are.
      my_lat: mine ? mine.lat : null,
      my_lng: mine ? mine.lng : null,
      located_count: nearby.filter(n => n.distance_km !== null).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}