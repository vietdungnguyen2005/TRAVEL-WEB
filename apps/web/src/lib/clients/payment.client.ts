import apiClient from '../api-client';
import { PaymentRequest, PaymentResponse } from '@travel-web/contracts';

const paymentClient = {
  async createPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post('/payment', data);
    return response.data;
  },

  async getPaymentStatus(id: string): Promise<PaymentResponse> {
    const response = await apiClient.get(`/payment/${id}`);
    return response.data;
  },
};

export default paymentClient;
