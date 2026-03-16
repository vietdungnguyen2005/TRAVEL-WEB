import type { ReviewRepository } from '../ports/review-repository';

export async function verifyReview(deps: {
    reviews: ReviewRepository;
    reviewId: string;
}) {
    const review = await deps.reviews.findById(deps.reviewId);
    if (!review) {
        throw Object.assign(new Error('Review not found'), { statusCode: 404 });
    }

    return deps.reviews.verify(deps.reviewId);
}
