import type { ReviewRepository } from '../ports/review-repository';

export async function listAllReviews(deps: {
    reviews: ReviewRepository;
}) {
    return deps.reviews.findAll();
}
