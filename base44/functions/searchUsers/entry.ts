import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { ageGroupOf } from '../../shared/recruitmentPolicy.ts';
import { safeMemberName } from '../../shared/memberAccess.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { query } = await req.json();
    const group = ageGroupOf(user);
    if (!group) return Response.json({ results: [], age_required: true });
    if (typeof query !== 'string' || query.trim().length < 2 || query.length > 100 || query.includes('@')) return Response.json({ results: [] });
    const q = query.trim().toLowerCase();
    const results = [];
    let cursor;
    do {
      const page = await base44.asServiceRole.entities.User.filter({ age_group: group }, { limit: 100, cursor });
      for (const member of page.items) {
        const name = safeMemberName(member);
        if (member.id !== user.id && name.toLowerCase().includes(q)) results.push({ id: member.id, full_name: name });
        if (results.length === 10) break;
      }
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor && results.length < 10);
    return Response.json({ results, age_required: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}