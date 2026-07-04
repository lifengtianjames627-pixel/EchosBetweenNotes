import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    if (!query || query.trim().length < 2) return Response.json({ results: [] });

    const q = query.trim().toLowerCase();
    const allUsers = await base44.asServiceRole.entities.User.list();

    const results = allUsers
      .filter(u => u.email !== user.email)
      .filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
      .slice(0, 10)
      .map(u => ({ full_name: u.full_name, email: u.email }));

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});