"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingClient = void 0;
const api_client_1 = __importDefault(require("../lib/api-client"));
class BookingClient {
    async createBooking(data) {
        const response = await api_client_1.default.post(`/api/bookings`, data);
        return response.data;
    }
    async getBooking(id) {
        const response = await api_client_1.default.get(`/api/bookings/${id}`);
        return response.data;
    }
    async getUserBookings(userId) {
        const response = await api_client_1.default.get(`/api/bookings/user/${userId}`);
        return response.data;
    }
}
exports.BookingClient = BookingClient;
//# sourceMappingURL=booking-client.js.map