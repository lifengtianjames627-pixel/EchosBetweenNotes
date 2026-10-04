import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useRecruitPosts(user) {
  return useQuery({
    queryKey: ['recruit-posts', user?.id, user?.age_group],
    queryFn: () => base44.entities.RecruitPost.filter({
      status: 'active', author_age_group: user.age_group,
      moderation_status: { $in: ['approved', '', null] },
    }, '-created_date', 200),
    enabled: !!user?.id && ['under_15', 'age_15_plus'].includes(user.age_group),
  });
}