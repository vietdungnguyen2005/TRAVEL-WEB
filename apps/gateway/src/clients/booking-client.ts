import apiClient from '../lib/api-client';
import { CreateBookingDTO, BookingResponseDTO } from '@travel-web/contracts';

export class BookingClient {
    async createBooking(data: CreateBookingDTO): Promise<BookingResponseDTO> {
        const response = await apiClient.post(`/api/bookings`, data);
        return response.data;
    }

    async getBooking(id: string): Promise<BookingResponseDTO> {
        const response = await apiClient.get(`/api/bookings/${id}`);
        return response.data;
    }

    async getUserBookings(userId: string): Promise<BookingResponseDTO[]> {
        const response = await apiClient.get(`/api/bookings/user/${userId}`);
        return response.data;
    }
}