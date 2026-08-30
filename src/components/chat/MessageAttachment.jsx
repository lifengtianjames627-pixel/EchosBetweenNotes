import React from 'react';
import { FileText } from 'lucide-react';

// Renders an attached image inline, or a PDF/file as a tappable paper chip.
export default function MessageAttachment({ V, url, name, kind }) {
  if (!url) return null;
  if (kind === 'image') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block mt-1">
        <img src={url} alt={name || ''} className="rounded-xl max-h-56 max-w-full object-cover" style={{ border: `1px solid ${V.border}` }} />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl hover:underline"
      style={{ background: '#faf8f2', border: `1px solid ${V.border}`, color: '#8a5a20' }}
    >
      <FileText className="w-4 h-4 shrink-0" />
      <span className="text-xs truncate max-w-[220px]">{name || 'Attachment'}</span>
    </a>
  );
}