import { BookingRequest, BookingResponse } from '@travel-web/contracts';
declare const bookingClient: {
    createBooking(data: BookingRequest): Promise<BookingResponse>;
    getBooking(id: string): Promise<BookingResponse>;
};
export default bookingClient;
//# sourceMappingURL=booking.client.d.ts.map