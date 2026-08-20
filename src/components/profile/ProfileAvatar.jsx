import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Avatar with optional uploaded picture. When `editable` is true, a camera
// button overlays the avatar: pick a file → upload → save the URL on the user.
export default function ProfileAvatar({ pictureUrl, initial, size = 74, editable, onUploaded }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      onUploaded?.(file_url);
    } finally {
      setBusy(false);
    }
  };

  const dim = { width: size, height: size };

  return (
    <div className="relative shrink-0" style={dim}>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(150deg, rgba(28,24,66,0.98), rgba(12,15,35,0.98))',
          color: '#c4baff',
          border: '1px solid rgba(124,111,255,0.35)',
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: size * 0.4,
          fontWeight: 900,
        }}>
        {pictureUrl
          ? <img src={pictureUrl} alt="profile" className="w-full h-full object-cover" />
          : initial}
      </div>

      {editable && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,111,255,0.95)', color: '#0a0d20', border: '2px solid #0a0d20' }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => upload(e.target.files?.[0])}
      />
    </div>
  );
}