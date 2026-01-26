interface BookingSummaryProps {
    roomName: string;
    roomImage: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    nights: number;
    pricePerNight: number;
    totalPrice: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
}
export declare function BookingSummary({ roomName, roomImage, checkIn, checkOut, guests, nights, pricePerNight, totalPrice, guestName, guestEmail, guestPhone, }: BookingSummaryProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=booking-summary.d.ts.map