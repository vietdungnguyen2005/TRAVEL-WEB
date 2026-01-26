import apiClient from '../api-client';
const reviewClient = {
    async createReview(data) {
        const response = await apiClient.post('/reviews', data);
        return response.data;
    },
    async getReviews() {
        const response = await apiClient.get('/reviews');
        return response.data;
    },
};
export default reviewClient;
//# sourceMappingURL=review.client.js.map