interface CancellationEmailProps {
    customerName: string;
    bookingId: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: string;
    refundAmount?: string;
    cancellationReason?: string;
}
export declare const CancellationEmail: ({ customerName, bookingId, roomType, checkInDate, checkOutDate, totalPrice, refundAmount, cancellationReason, }: CancellationEmailProps) => import("react/jsx-runtime").JSX.Element;
export default CancellationEmail;
//# sourceMappingURL=cancellation-email.d.ts.map