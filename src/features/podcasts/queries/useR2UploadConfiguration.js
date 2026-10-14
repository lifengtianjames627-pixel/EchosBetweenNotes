import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useR2UploadConfiguration() {
  return useQuery({ queryKey: ['podcasts', 'r2-configuration', window.location.origin], retry: false,
    queryFn: async () => { const response = await base44.functions.invoke('podcastUpload', { action: 'configuration', origin: window.location.origin }); return /** @type {{ cors_ready: boolean, connection_ok: boolean, policy: object[] }} */ (response.data); } });
}