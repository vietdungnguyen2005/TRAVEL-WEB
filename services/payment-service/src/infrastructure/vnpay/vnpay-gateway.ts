import crypto from 'crypto';
import qs from 'qs';
import type { VnpayGateway, VnpayCreatePaymentUrlInput, VnpayVerifyResult } from '../../application/ports/vnpay-gateway';

function getConfig() {
    const tmnCode = process.env.VNP_TMN_CODE;
    const hashSecret = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    if (!tmnCode || !hashSecret) throw new Error('VNPay not configured: VNP_TMN_CODE and VNP_HASH_SECRET required');
    return { tmnCode, hashSecret, vnpUrl };
}

/**
 * Exact copy of VNPay official demo sortObject function.
 * Encodes both keys and values, replaces %20 with +.
 */
function sortObject(obj: Record<string, string | number>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }

    str.sort();

    for (let i = 0; i < str.length; i++) {
        const rawKey = decodeURIComponent(str[i]);
        sorted[str[i]] = encodeURIComponent(String(obj[rawKey])).replace(/%20/g, '+');
    }

    return sorted;
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}${h}${min}${s}`;
}

export function createVnpayGateway(): VnpayGateway {
    return {
        createPaymentUrl(input: VnpayCreatePaymentUrlInput): string {
            const { tmnCode, hashSecret, vnpUrl } = getConfig();

            const now = new Date();
            const createDate = formatDate(now);

            let vnp_Params: Record<string, string | number> = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: input.bookingId,
                vnp_OrderInfo: input.orderInfo,
                vnp_OrderType: 'other',
                vnp_Amount: Math.round(input.amount) * 100,
                vnp_ReturnUrl: input.returnUrl,
                vnp_IpAddr: input.ipAddress,
                vnp_CreateDate: createDate,
            };

            // Exactly follow VNPay demo: sortObject encodes keys+values, then qs.stringify with encode:false
            vnp_Params = sortObject(vnp_Params);

            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', hashSecret);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            (vnp_Params as Record<string, string>)['vnp_SecureHash'] = signed;

            const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

            return paymentUrl;
        },

        verifyReturnParams(params: Record<string, string>) {
            return verifyParams(params);
        },

        verifyIpnParams(params: Record<string, string>) {
            return verifyParams(params);
        },
    };
}

function verifyParams(params: Record<string, string>): VnpayVerifyResult {
    const { hashSecret } = getConfig();
    const receivedHash = params['vnp_SecureHash'] || '';

    const verifyObj: Record<string, string | number> = { ...params };
    delete verifyObj['vnp_SecureHash'];
    delete verifyObj['vnp_SecureHashType'];

    const sorted = sortObject(verifyObj);
    const signData = qs.stringify(sorted, { encode: false });
    const expectedHash = crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = receivedHash === expectedHash;
    const vnpTxnRef = params['vnp_TxnRef'] || null;

    return {
        isValid,
        responseCode: params['vnp_ResponseCode'] || '',
        bookingId: vnpTxnRef,
        vnpTransactionNo: params['vnp_TransactionNo'] || null,
        vnpTxnRef,
        amount: Math.round(Number(params['vnp_Amount'] || 0) / 100),
    };
}
