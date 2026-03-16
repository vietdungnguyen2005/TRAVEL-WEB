import type { ReviewRepository } from '../ports/review-repository';

export async function getReviewsByRoom(deps: {
    reviews: ReviewRepository;
    roomTypeId: string;
}) {
    return deps.reviews.findManyByRoomTypeId(deps.roomTypeId);
}
