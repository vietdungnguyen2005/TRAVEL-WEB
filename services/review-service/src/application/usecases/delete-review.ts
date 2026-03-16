import type { ReviewRepository } from '../ports/review-repository';

export async function deleteReview(deps: {
    reviews: ReviewRepository;
    reviewId: string;
    userId: string;
    isAdmin: boolean;
}) {
    const review = await deps.reviews.findById(deps.reviewId);
    if (!review) {
        throw Object.assign(new Error('Review not found'), { statusCode: 404 });
    }
    if (!deps.isAdmin && review.userId !== deps.userId) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    await deps.reviews.delete(deps.reviewId);
}
