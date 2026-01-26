"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = require("express");
const booking_client_1 = require("../clients/booking-client");
const contracts_1 = require("@travel-web/contracts");
exports.bookingRoutes = (0, express_1.Router)();
const bookingClient = new booking_client_1.BookingClient();
exports.bookingRoutes.post('/', async (req, res, next) => {
    try {
        const validatedData = contracts_1.CreateBookingSchema.parse(req.body);
        const booking = await bookingClient.createBooking(validatedData);
        res.status(201).json(booking);
    }
    catch (error) {
        next(error);
    }
});
exports.bookingRoutes.get('/:id', async (req, res, next) => {
    try {
        const booking = await bookingClient.getBooking(req.params.id);
        res.json(booking);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=booking.js.map