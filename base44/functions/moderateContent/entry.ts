import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim().length === 0) {
      return Response.json({ isFlagged: false, confidence: 0, categories: [], reason: '', suggestedAction: 'allow' });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation AI. Analyze the following user-submitted text for a music review forum.
The text may be in English or Chinese. Detect if it violates community guidelines.

Detection categories:
- hate: hate speech or discrimination based on race, gender, religion, etc.
- harassment: personal attacks or targeted harassment
- profanity: strong offensive language or swearing
- spam: advertising, repetitive content, or off-topic promotion
- sexual: sexual or explicit content
- violence: violent or threatening content
- privacy: sharing personal private information

Text to analyze:
"""
${text}
"""

Respond with a JSON object only, no explanation:
{
  "isFlagged": boolean,
  "confidence": number between 0.0 and 1.0,
  "categories": array of matched category strings from the list above,
  "reason": short one-sentence explanation in English,
  "suggestedAction": "block" if confidence > 0.85 and isFlagged, "review" if confidence > 0.5 and isFlagged, otherwise "allow"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          isFlagged: { type: 'boolean' },
          confidence: { type: 'number' },
          categories: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
          suggestedAction: { type: 'string' }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    // On AI failure: default to allow + log, never block users due to system error
    console.error('Moderation error:', error.message);
    return Response.json({
      isFlagged: false,
      confidence: 0,
      categories: [],
      reason: 'Moderation service unavailable',
      suggestedAction: 'allow'
    });
  }
});