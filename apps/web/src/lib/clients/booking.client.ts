import apiClient from '../api-client';
import { BookingRequest, BookingResponse } from '@travel-web/contracts';

const bookingClient = {
  async createBooking(data: BookingRequest): Promise<BookingResponse> {
    const response = await apiClient.post('/booking', data);
    return response.data;
  },

  async getBooking(id: string): Promise<BookingResponse> {
    const response = await apiClient.get(`/booking/${id}`);
    return response.data;
  },
};

export default bookingClient;
