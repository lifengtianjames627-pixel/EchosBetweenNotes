import { requestR2, signedR2Url } from './r2Storage.ts';
const publishedOrigin = 'https://echoesbetnotes.base44.app';
export async function r2Configuration(origin) {
  if (typeof origin !== 'string' || origin.length > 300) throw Object.assign(new Error('INVALID_ORIGIN'), { status: 400 });
  const parsed = new URL(origin);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== origin) throw Object.assign(new Error('INVALID_ORIGIN'), { status: 400 });
  await requestR2('HEAD');
  const origins = [...new Set([publishedOrigin, origin])];
  const checks = await Promise.all(origins.map(async site => {
    const url = await signedR2Url('PUT', 'podcasts/cors-check', {}, 'audio/wav', 60);
    const response = await fetch(url, { method: 'OPTIONS', headers: { origin: site, 'access-control-request-method': 'PUT', 'access-control-request-headers': 'content-type' }, signal: AbortSignal.timeout(10000) });
    const allowed = response.headers.get('access-control-allow-origin'), methods = response.headers.get('access-control-allow-methods') || '';
    await response.body?.cancel();
    return response.ok && (allowed === site || allowed === '*') && methods.toUpperCase().includes('PUT');
  }));
  return { connection_ok: true, cors_ready: checks.every(Boolean), policy: [{ AllowedOrigins: origins, AllowedMethods: ['GET', 'PUT', 'HEAD'], AllowedHeaders: ['Content-Type', 'Range'], ExposeHeaders: ['ETag', 'Content-Length', 'Content-Range'], MaxAgeSeconds: 3600 }] };
}