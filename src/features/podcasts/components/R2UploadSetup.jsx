import React from 'react';
/** @param {{ setup: ReturnType<typeof import('@/features/podcasts/queries/useR2UploadConfiguration').default>, copy: ReturnType<typeof import('@/features/podcasts/i18n/podcastCopy').default> }} props */
export default function R2UploadSetup({ setup, copy }) {
  if (setup.isLoading) return <p role="status" className="text-xs text-muted-foreground">{copy.r2Verifying}</p>;
  if (setup.data?.connection_ok) return <p data-testid="r2-upload-ready" className="text-xs text-muted-foreground">{copy.r2Ready}</p>;
  return <div className="space-y-2 text-xs"><p role="alert" className="text-destructive">{copy.r2Failed}</p><button type="button" disabled={setup.isFetching} onClick={() => setup.refetch()} className="text-accent underline disabled:opacity-50">{setup.isFetching ? copy.r2Verifying : copy.r2Check}</button></div>;
}