import type { VnpayGateway } from '../ports/vnpay-gateway';
import type { PaymentRepository } from '../ports/payment-repository';

/**
 * Handles the VNPay browser-return (returnUrl) callback.
 *
 * **Important**: This handler intentionally does NOT publish events.
 * The authoritative payment confirmation comes from the IPN callback
 * (`handleVnpayIpn`), which has idempotency protection and is guaranteed
 * to be called by VNPay's server. Publishing here would cause duplicate
 * `PaymentCompleted` events because VNPay sends both the browser redirect
 * and the IPN callback.
 */
export async function verifyVnpayReturn(deps: {
    vnpay: VnpayGateway;
    payments: PaymentRepository;
    params: Record<string, string>;
}) {
    const result = deps.vnpay.verifyReturnParams(deps.params);

    if (!result.isValid) {
        return { ok: false as const, error: 'Invalid secure hash' };
    }

    if (!result.bookingId) {
        return { ok: false as const, error: 'Booking ID not found in response' };
    }

    if (result.responseCode !== '00') {
        return { ok: false as const, bookingId: result.bookingId, error: `Payment not successful (code: ${result.responseCode})` };
    }

    // Optimistically mark payment completed in DB.
    // If the IPN arrives first, this is a no-op (already COMPLETED).
    await deps.payments.markCompletedByBookingId({
        bookingId: result.bookingId,
        vnpTransactionNo: result.vnpTransactionNo || undefined,
    });

    // Do NOT publish PaymentCompleted event here — let handleVnpayIpn be the
    // single source of truth for event publishing.

    return { ok: true as const, bookingId: result.bookingId, vnpTransactionNo: result.vnpTransactionNo };
}
