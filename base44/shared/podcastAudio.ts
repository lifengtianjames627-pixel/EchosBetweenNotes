export const MAX_AUDIO_BYTES = 1024 * 1024 * 1024;
export const PART_BYTES = 16 * 1024 * 1024;
export const audioTypes = { wav: 'audio/wav', mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac', webm: 'audio/webm' };
export function audioMetadata(name, size) {
  const extension = typeof name === 'string' ? name.split('.').pop().toLowerCase() : '';
  if (!name || name.length > 240 || !audioTypes[extension] || !Number.isSafeInteger(size) || size < 16 || size > MAX_AUDIO_BYTES) throw Object.assign(new Error('INVALID_AUDIO'), { status: 400 });
  return { extension, content_type: audioTypes[extension] };
}
export function validAudioHeader(extension, bytes) {
  const text = new TextDecoder().decode(bytes), frame = bytes[0] === 255 && (bytes[1] & 224) === 224;
  const valid = { wav: text.startsWith('RIFF') && text.slice(8, 12) === 'WAVE', mp3: text.startsWith('ID3') || frame, m4a: text.slice(4, 8) === 'ftyp', aac: frame, ogg: text.startsWith('OggS'), opus: text.startsWith('OggS'), flac: text.startsWith('fLaC'), webm: bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163 };
  return !!valid[extension];
}