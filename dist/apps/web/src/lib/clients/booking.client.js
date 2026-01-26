import apiClient from '../api-client';
const bookingClient = {
    async createBooking(data) {
        const response = await apiClient.post('/booking', data);
        return response.data;
    },
    async getBooking(id) {
        const response = await apiClient.get(`/booking/${id}`);
        return response.data;
    },
};
export default bookingClient;
//# sourceMappingURL=booking.client.js.map