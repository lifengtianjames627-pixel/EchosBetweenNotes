import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export function usePodcastTotals() {
  return useQuery({ queryKey: ['podcasts', 'totals'], queryFn: () => base44.entities.Podcast.aggregate({ groupBy: 'category', sum: 'duration_minutes' }) });
}
export function usePodcastEpisodes(category) {
  return useInfiniteQuery({ queryKey: ['podcasts', 'series', category], initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const page = await base44.entities.Podcast.filter({ category }, { sort: '-created_date', limit: 20, cursor: pageParam });
      return { ...page, items: /** @type {import('@/features/podcasts/model/podcastTypes').PodcastEpisode[]} */ (page.items) };
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined, enabled: !!category });
}
export function usePublishPodcast(onSuccess) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (/** @type {import('@/features/podcasts/model/podcastTypes').PodcastFields & { file: File, duration_minutes: number }} */ data) => {
      const response = await base44.functions.invoke('publishPodcast', data);
      return response.data.episode;
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ['podcasts'] }); client.invalidateQueries({ queryKey: ['homeFeed'] }); onSuccess(); },
  });
}