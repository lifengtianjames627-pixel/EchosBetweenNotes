import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Public-facing profile card for ANOTHER member. The User entity blocks
// non-admins from reading other people, so the few public fields are read with
// the service role and only those fields are returned — never the raw record.
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = await req.json();
    if (!email) return Response.json({ error: 'email required' }, { status: 400 });

    const matches = await base44.asServiceRole.entities.User.filter({ email });
    const target = matches[0];
    if (!target) return Response.json({ found: false });

    const lastActive = target.last_active || null;
    return Response.json({
      found: true,
      email: target.email,
      full_name: target.full_name || '',
      equipped_badges: target.equipped_badges || [],
      last_active: lastActive,
      online: !!lastActive && (Date.now() - new Date(lastActive).getTime()) < ONLINE_WINDOW_MS,
      is_me: target.email === user.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}