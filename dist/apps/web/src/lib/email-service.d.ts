interface BookingData {
    id: string;
    user: {
        email: string;
        name: string | null;
    };
    room: {
        roomNumber: string;
        roomType: {
            name: string;
        };
    };
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    totalPrice: number;
    paymentMethod: string;
}
export declare function sendBookingConfirmationEmail(booking: BookingData): Promise<{
    success: boolean;
    data: import("resend").CreateEmailResponseSuccess;
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
}>;
export declare function sendCheckInReminderEmail(booking: BookingData): Promise<{
    success: boolean;
    data: import("resend").CreateEmailResponseSuccess;
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
}>;
export declare function sendCancellationEmail(booking: BookingData, refundAmount?: number, cancellationReason?: string): Promise<{
    success: boolean;
    data: import("resend").CreateEmailResponseSuccess;
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
}>;
export {};
//# sourceMappingURL=email-service.d.ts.map