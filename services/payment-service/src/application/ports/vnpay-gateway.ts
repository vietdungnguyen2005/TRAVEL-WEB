export type VnpayCreatePaymentUrlInput = {
    bookingId: string;
    userId?: string;
    amount: number;
    orderInfo: string;
    returnUrl: string;
    ipnUrl: string;
    ipAddress: string;
};

export type VnpayVerifyResult = {
    isValid: boolean;
    responseCode: string;
    bookingId: string | null;
    vnpTransactionNo: string | null;
    vnpTxnRef: string | null;
    amount: number;
};

export type VnpayGateway = {
    createPaymentUrl(input: VnpayCreatePaymentUrlInput): string;
    verifyReturnParams(params: Record<string, string>): VnpayVerifyResult;
    verifyIpnParams(params: Record<string, string>): VnpayVerifyResult;
};
