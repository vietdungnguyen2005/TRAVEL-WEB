import apiClient from '../api-client';
const paymentClient = {
    async createPayment(data) {
        const response = await apiClient.post('/payment', data);
        return response.data;
    },
    async getPaymentStatus(id) {
        const response = await apiClient.get(`/payment/${id}`);
        return response.data;
    },
};
export default paymentClient;
//# sourceMappingURL=payment.client.js.map