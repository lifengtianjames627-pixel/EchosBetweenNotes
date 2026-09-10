import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useCurrentReview(seed) {
  const { data } = useQuery({ queryKey: ['review-record', seed?.id], enabled: !!seed?.id, queryFn: async () => (await base44.entities.Review.filter({ id: seed.id }))[0] || null });
  return data === undefined ? seed : data;
}