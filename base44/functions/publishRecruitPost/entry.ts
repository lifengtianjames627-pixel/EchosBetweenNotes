import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { ageGroupOf } from '../../shared/recruitmentPolicy.ts';
import { recruitmentDraft, recruitmentText, containsRecruitmentContact } from '../../shared/recruitmentDraft.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const age = ageGroupOf(user);
    if (!age) return Response.json({ error: 'AGE_REQUIRED' }, { status: 403 });
    const body = await req.json();
    const draft = recruitmentDraft(body.draft);
    if (!draft || body.agreed !== true) return Response.json({ error: 'INVALID_DRAFT' }, { status: 400 });
    const text = recruitmentText(draft);
    if (containsRecruitmentContact(text)) return Response.json({ error: 'CONTACT' }, { status: 400 });
    // Image posters require human review; the existing moderation function analyzes text only.
    let action = 'review';
    let reason = draft.poster_url ? 'Poster image requires manual review' : 'Moderation unavailable; manual review required';
    if (!draft.poster_url) {
      try {
        const { data } = await base44.functions.invoke('moderateContent', { text });
        if (['allow', 'review', 'block'].includes(data?.suggestedAction) &&
            typeof data.isFlagged === 'boolean' && typeof data.confidence === 'number' &&
            data.reason !== 'Moderation service unavailable') {
          action = data.suggestedAction;
          reason = typeof data.reason === 'string' ? data.reason : '';
        }
      } catch { /* Remain pending when moderation cannot finish. */ }
    }
    if (action === 'block') return Response.json({ error: 'MODERATION' }, { status: 422 });
    const name = user.display_name || user.full_name || 'Anonymous';
    let post = await base44.entities.RecruitPost.create({
      ...draft, author_email: user.email, author_name: name.includes('@') ? 'Anonymous' : name,
      author_age_group: age, status: 'active', moderation_status: 'pending_review',
      moderation_reason: reason, report_count: 0,
    });
    if (action === 'allow') {
      try {
        post = await base44.asServiceRole.entities.RecruitPost.update(post.id, { moderation_status: 'approved' });
      } catch { action = 'review'; }
    }
    return Response.json({ id: post.id, action, moderation_status: action === 'allow' ? 'approved' : 'pending_review' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}