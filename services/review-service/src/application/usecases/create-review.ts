import type { ReviewRepository, CreateReviewInput } from '../ports/review-repository';

export async function createReview(deps: {
    reviews: ReviewRepository;
    input: CreateReviewInput;
}) {
    // Enforce one review per booking per user
    const existing = await deps.reviews.findByUserAndBooking(
        deps.input.userId,
        deps.input.bookingId,
    );
    if (existing) {
        throw Object.assign(new Error('You have already reviewed this booking'), { statusCode: 409 });
    }

    if (deps.input.rating < 1 || deps.input.rating > 5) {
        throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }

    return deps.reviews.create(deps.input);
}
