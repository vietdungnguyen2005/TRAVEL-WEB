import type { ReviewRepository, UpdateReviewInput } from '../ports/review-repository';

export async function updateReview(deps: {
    reviews: ReviewRepository;
    reviewId: string;
    userId: string;
    input: UpdateReviewInput;
}) {
    const review = await deps.reviews.findById(deps.reviewId);
    if (!review) {
        throw Object.assign(new Error('Review not found'), { statusCode: 404 });
    }
    if (review.userId !== deps.userId) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    if (deps.input.rating !== undefined && (deps.input.rating < 1 || deps.input.rating > 5)) {
        throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }

    return deps.reviews.update(deps.reviewId, deps.input);
}
