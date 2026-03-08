import type { VnpayGateway } from '../ports/vnpay-gateway';
import type { PaymentRepository } from '../ports/payment-repository';

export async function createPaymentUrl(deps: {
    vnpay: VnpayGateway;
    payments: PaymentRepository;
    input: {
        bookingId: string;
        userId?: string;
        amount: number;
        appUrl: string;
        ipAddress: string;
    };
}) {
    const { bookingId, userId, amount, appUrl, ipAddress } = deps.input;
    if (!bookingId || !amount) throw new Error('bookingId and amount are required');

    const returnUrl = `${appUrl}/booking/success`;
    const ipnUrl = `${process.env.PAYMENT_IPN_URL || `http://localhost:3004`}/api/payments/vnpay-ipn`;

    const url = deps.vnpay.createPaymentUrl({
        bookingId,
        userId,
        amount,
        orderInfo: `Thanh toan dat phong ${bookingId.slice(0, 8).toUpperCase()}`,
        returnUrl,
        ipnUrl,
        ipAddress,
    });

    await deps.payments.upsertPaymentUrl({
        bookingId,
        userId: String(userId || 'unknown'),
        amount: Number(amount),
        currency: 'vnd',
        vnpTxnRef: bookingId,
        metadata: { bookingId, userId },
    });

    return { url };
}
