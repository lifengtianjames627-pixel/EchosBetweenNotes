export function ageGroupOf(user) {
  return ['minor', 'adult'].includes(user?.age_group) ? user.age_group : null;
}
export function sameAgeGroup(viewer, peer) {
  const group = ageGroupOf(viewer);
  return !!group && ageGroupOf(peer) === group;
}
export function publicRecruitment(post) {
  return post.status === 'active' && [undefined, null, '', 'approved'].includes(post.moderation_status);
}
export function publicRecruitmentQuery(group) {
  return { status: 'active', author_age_group: group, moderation_status: { $in: ['approved', '', null] } };
}