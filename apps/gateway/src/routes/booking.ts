import { Router } from 'express';
import { BookingClient } from '../clients/booking-client';
import { CreateBookingSchema } from '@travel-web/contracts';

export const bookingRoutes = Router();
const bookingClient = new BookingClient();

bookingRoutes.post('/', async (req, res, next) => {
  try {
    const validatedData = CreateBookingSchema.parse(req.body);
    const booking = await bookingClient.createBooking(validatedData);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

bookingRoutes.get('/:id', async (req, res, next) => {
  try {
    const booking = await bookingClient.getBooking(req.params.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});