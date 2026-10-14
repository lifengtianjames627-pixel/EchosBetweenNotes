export async function validatePodcastCover(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size || file.size > 5 * 1024 * 1024) return null;
  const extension = String(file.name || '').split('.').pop().toLowerCase();
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP';
  const valid = { png, jpg: jpeg, jpeg, webp }, types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
  return valid[extension] ? new File([file], file.name, { type: types[extension] }) : null;
}