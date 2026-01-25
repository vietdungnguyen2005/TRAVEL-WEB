import apiClient from '../api-client';
import { ReviewRequest, ReviewResponse } from '@travel-web/contracts';

const reviewClient = {
  async createReview(data: ReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  async getReviews(): Promise<ReviewResponse[]> {
    const response = await apiClient.get('/reviews');
    return response.data;
  },
};

export default reviewClient;
