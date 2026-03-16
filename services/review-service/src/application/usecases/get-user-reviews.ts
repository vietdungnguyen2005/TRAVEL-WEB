import type { ReviewRepository } from '../ports/review-repository';

export async function getUserReviews(deps: {
    reviews: ReviewRepository;
    userId: string;
}) {
    return deps.reviews.findManyByUserId(deps.userId);
}
