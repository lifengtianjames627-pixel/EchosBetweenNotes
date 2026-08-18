import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Builds the Messages landing lists for the signed-in user:
//  - conversations: one row per person they've already talked to, newest first
//  - nearby: EVERY other member who is reachable — same Wi-Fi network (matched
//    by a hashed network address recorded on each visit, no GPS needed), shared
//    map location, or active on the band board. Same-network people always rank
//    first, then real distance. Coordinates are never sent back exactly — only
//    ~1km-coarse pins and rounded km distances.

const NETWORK_WINDOW_MS = 24 * 60 * 60 * 1000; // "on the same Wi-Fi" = seen within 24h

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

    // Fingerprint the caller's network (same Wi-Fi = same public address) and
    // remember it on their record so friends on the same network find each other.
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || '';
    const myNet = ip ? await networkHash(ip) : null;
    const now = Date.now();
    if (myNet) {
      await svc.entities.User.update(user.id, { network_id: myNet, network_seen: new Date(now).toISOString() });
    }

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

      // Map pins use a ~1km-coarse position. Same-network people without their
      // own coordinates are placed at the viewer's coarse spot (same Wi-Fi).
      const src = theirs || (net ? mine : null);
      const coarse = src && (mine || net)
        ? { lat: Math.round(src.lat * 100) / 100, lng: Math.round(src.lng * 100) / 100 }
        : null;

      nearby.push({
        lat: coarse?.lat ?? null,
        lng: coarse?.lng ?? null,
        email: u.email,
        name: u.full_name || post?.author_name || u.email,
        city: post?.city || '',
        school: post?.school || '',
        kind: post?.kind || null,
        title: post?.title || '',
        same_network: net,
        distance_km: km === null ? null : Math.round(km * 10) / 10,
      });
    }

    nearby.sort((a, b) => {
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
      my_lat: mine ? Math.round(mine.lat * 100) / 100 : null,
      my_lng: mine ? Math.round(mine.lng * 100) / 100 : null,
      located_count: nearby.filter(n => n.distance_km !== null).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}