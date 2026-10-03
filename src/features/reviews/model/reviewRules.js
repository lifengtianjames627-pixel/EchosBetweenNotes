// Public visibility and legacy kind handling shared by review discovery.
export const isAlbumReview = review => !review.kind || review.kind === 'album_review';
export const isApproved = review => !review.moderation_status || review.moderation_status === 'approved';

export function groupPublicReviews(reviews) {
  const approved = reviews.filter(isApproved);
  return {
    albumReviews: approved.filter(isAlbumReview),
    stories: approved.filter(review => review.kind === 'journey_story'),
    roundups: approved.filter(review => review.kind === 'genre_roundup'),
  };
}