import { PaymentRequest, PaymentResponse } from '@travel-web/contracts';
declare const paymentClient: {
    createPayment(data: PaymentRequest): Promise<PaymentResponse>;
    getPaymentStatus(id: string): Promise<PaymentResponse>;
};
export default paymentClient;
//# sourceMappingURL=payment.client.d.ts.map