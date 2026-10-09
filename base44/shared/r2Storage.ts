import { secrets } from 'base44:runtime';
const encoder = new TextEncoder();
const encode = value => encodeURIComponent(String(value)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const hex = buffer => [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('');
const sha = async value => hex(await crypto.subtle.digest('SHA-256', typeof value === 'string' ? encoder.encode(value) : value));
async function hmac(key, value) { const imported = await crypto.subtle.importKey('raw', typeof key === 'string' ? encoder.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return crypto.subtle.sign('HMAC', imported, encoder.encode(value)); }
function config() {
  const endpoint = new URL(secrets.get('R2_ENDPOINT')), bucket = secrets.get('R2_BUCKET_NAME');
  const path = decodeURIComponent(endpoint.pathname).replace(/^\/+|\/+$/g, '');
  if (endpoint.protocol !== 'https:' || !/^[a-f0-9]{32}(\.(eu|us|fedramp))?\.r2\.cloudflarestorage\.com$/i.test(endpoint.hostname) || (path && path !== bucket) || endpoint.search || endpoint.username || endpoint.password || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('INVALID_R2_CONFIGURATION');
  return { endpoint: endpoint.origin, host: endpoint.host, bucket, access: secrets.get('R2_ACCESS_KEY_ID'), secret: secrets.get('R2_SECRET_ACCESS_KEY') };
}
async function signingKey(secret, day) { return hmac(await hmac(await hmac(await hmac('AWS4' + secret, day), 'auto'), 's3'), 'aws4_request'); }
const queryString = query => Object.keys(query).sort().map(key => encode(key) + '=' + encode(query[key])).join('&');
const objectPath = (bucket, key) => '/' + encode(bucket) + (key ? '/' + key.split('/').map(encode).join('/') : '');
export async function signedR2Url(method, key, query = {}, contentType = '', expires = 900) {
  const cfg = config(), time = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''), day = time.slice(0, 8), scope = day + '/auto/s3/aws4_request';
  const headers = { host: cfg.host, ...(contentType ? { 'content-type': contentType } : {}) }, names = Object.keys(headers).sort(), signed = names.join(';');
  const params = { ...query, 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': cfg.access + '/' + scope, 'X-Amz-Date': time, 'X-Amz-Expires': String(expires), 'X-Amz-SignedHeaders': signed };
  const path = objectPath(cfg.bucket, key), canonical = [method, path, queryString(params), names.map(name => name + ':' + headers[name] + '\n').join(''), signed, 'UNSIGNED-PAYLOAD'].join('\n');
  const signature = hex(await hmac(await signingKey(cfg.secret, day), ['AWS4-HMAC-SHA256', time, scope, await sha(canonical)].join('\n')));
  return cfg.endpoint + path + '?' + queryString(params) + '&X-Amz-Signature=' + signature;
}
export async function requestR2(method, key = '', query = {}, body = '', extraHeaders = {}, allowedStatuses = []) {
  const cfg = config(), time = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''), day = time.slice(0, 8), scope = day + '/auto/s3/aws4_request', hash = await sha(body);
  const headers = { ...extraHeaders, host: cfg.host, 'x-amz-date': time, 'x-amz-content-sha256': hash }, names = Object.keys(headers).sort(), signed = names.join(';');
  const path = objectPath(cfg.bucket, key), queryText = queryString(query), canonical = [method, path, queryText, names.map(name => name + ':' + headers[name] + '\n').join(''), signed, hash].join('\n');
  const signature = hex(await hmac(await signingKey(cfg.secret, day), ['AWS4-HMAC-SHA256', time, scope, await sha(canonical)].join('\n')));
  delete headers.host;
  headers.authorization = 'AWS4-HMAC-SHA256 Credential=' + cfg.access + '/' + scope + ', SignedHeaders=' + signed + ', Signature=' + signature;
  const response = await fetch(cfg.endpoint + path + (queryText ? '?' + queryText : ''), { method, headers, ...(method !== 'GET' && method !== 'HEAD' && body ? { body } : {}), signal: AbortSignal.timeout(20000) });
  if (!response.ok && !allowedStatuses.includes(response.status)) { const text = await response.text(); const code = text.match(/<Code>([A-Za-z0-9]+)<\/Code>/)?.[1] || String(response.status); throw new Error('R2_' + code); }
  return response;
}
export const xmlValue = (xml, tag) => (xml.match(new RegExp('<' + tag + '>([^<]*)</' + tag + '>'))?.[1] || '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
export const escapeXml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');