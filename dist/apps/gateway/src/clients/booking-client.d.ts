import { CreateBookingDTO, BookingResponseDTO } from '@travel-web/contracts';
export declare class BookingClient {
    createBooking(data: CreateBookingDTO): Promise<BookingResponseDTO>;
    getBooking(id: string): Promise<BookingResponseDTO>;
    getUserBookings(userId: string): Promise<BookingResponseDTO[]>;
}
//# sourceMappingURL=booking-client.d.ts.map