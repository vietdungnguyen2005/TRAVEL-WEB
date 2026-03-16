import type { VnpayGateway } from '../ports/vnpay-gateway';
import type { PaymentRepository } from '../ports/payment-repository';
import { AppError } from '@travel-web/shared';

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

    // Check if payment already exists and is completed
    const existingPayment = await deps.payments.findByBookingId(bookingId);
    if (existingPayment && existingPayment.status === 'COMPLETED') {
        throw new AppError(400, 'Booking already paid');
    }

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
