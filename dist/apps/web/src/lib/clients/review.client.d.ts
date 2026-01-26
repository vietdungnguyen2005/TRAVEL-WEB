import { ReviewRequest, ReviewResponse } from '@travel-web/contracts';
declare const reviewClient: {
    createReview(data: ReviewRequest): Promise<ReviewResponse>;
    getReviews(): Promise<ReviewResponse[]>;
};
export default reviewClient;
//# sourceMappingURL=review.client.d.ts.map