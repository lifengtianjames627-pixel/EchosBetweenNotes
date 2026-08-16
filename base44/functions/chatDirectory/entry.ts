import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Builds the Messages landing lists for the signed-in user:
//  - conversations: one row per person they've already talked to, newest first
//  - nearby: people active on the band board in the same city (same age bracket only)
// Service role is needed to scan chat ids / posts, but only the caller's own
// conversations and age-bracket-safe people are ever returned.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const [messages, posts] = await Promise.all([
      svc.entities.ChatMessage.list('-created_date', 500),
      svc.entities.RecruitPost.filter({ status: 'active' }, '-created_date', 200),
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

    const candidates = posts.filter(p =>
      p.author_email && p.author_email !== user.email &&
      p.moderation_status !== 'blocked' &&
      (!ageGroup || !p.author_age_group || p.author_age_group === ageGroup)
    );
    const sameCity = myCity
      ? candidates.filter(p => (p.city || '').toLowerCase() === myCity.toLowerCase())
      : [];
    const pool = sameCity.length ? sameCity : candidates;

    const seen = new Set();
    const nearby = [];
    for (const p of pool) {
      if (seen.has(p.author_email)) continue;
      seen.add(p.author_email);
      nearby.push({
        email: p.author_email,
        name: p.author_name || p.author_email,
        city: p.city || '',
        school: p.school || '',
        kind: p.kind,
        title: p.title || '',
      });
      if (nearby.length >= 12) break;
    }

    return Response.json({
      conversations: conversations.slice(0, 25),
      nearby,
      my_city: myCity,
      matched_city: sameCity.length > 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});