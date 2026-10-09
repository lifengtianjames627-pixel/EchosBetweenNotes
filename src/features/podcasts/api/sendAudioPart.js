export default function sendAudioPart(url, blob, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url); request.timeout = 300000; request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = event => onProgress(event.loaded);
    request.onload = () => { if (request.status >= 200 && request.status < 300) { onProgress(blob.size); resolve(true); } else reject(new Error('R2_PART_UPLOAD_FAILED')); };
    request.onerror = request.ontimeout = request.onabort = () => reject(new Error('R2_PART_UPLOAD_FAILED'));
    request.send(blob);
  });
}