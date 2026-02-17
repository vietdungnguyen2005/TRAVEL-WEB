export {};
export type PaymentRequest = {
    amount: number;
    currency: string;
    paymentMethod: string;
};
export type PaymentResponse = {
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    amount: number;
    currency: string;
    createdAt: string;
};
//# sourceMappingURL=payments.d.ts.map