interface BookingConfirmationEmailProps {
    customerName: string;
    bookingId: string;
    roomType: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: string;
    paymentMethod: string;
}
export declare const BookingConfirmationEmail: ({ customerName, bookingId, roomType, roomNumber, checkInDate, checkOutDate, numberOfGuests, totalPrice, paymentMethod, }: BookingConfirmationEmailProps) => import("react/jsx-runtime").JSX.Element;
export default BookingConfirmationEmail;
//# sourceMappingURL=booking-confirmation.d.ts.map